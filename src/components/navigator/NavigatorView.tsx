import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ConvertGlobalRoomIdMessageComposer, HabboWebTools, ILinkEventTracker, LegacyExternalInterface, NavigatorCategoryDataParser, NavigatorInitComposer, NavigatorSearchComposer, NavigatorSearchResultSet, NavigatorTopLevelContext, RoomDataParser, RoomSessionEvent } from '@nitrots/nitro-renderer';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { AddEventLinkTracker, DoorStateType, LocalizeText, RemoveLinkEventTracker, SendMessageComposer, TryVisitRoom } from '../../api';
import { Base, Column, NitroCardContentView, NitroCardView } from '../../common';
import { UseRoomSessionManagerEvent, useSharedNavigatorData } from '../../hooks';
import { NavigatorContextProvider } from './NavigatorContext';
import { NavigatorMessageHandler } from './NavigatorMessageHandler';
import { NavigatorDoorStateView } from './views/NavigatorDoorStateView';
import { NavigatorRoomCreatorView } from './views/NavigatorRoomCreatorView';
import { NavigatorRoomInfoView } from './views/NavigatorRoomInfoView';
import { NavigatorRoomLinkView } from './views/NavigatorRoomLinkView';
import { NavigatorRoomSettingsView } from './views/room-settings/NavigatorRoomSettingsView';
import { NavigatorSearchResultView } from './views/search/NavigatorSearchResultView';
import { NavigatorSearchView } from './views/search/NavigatorSearchView';

export const NavigatorView: FC<{}> = props =>
{
    const [ isVisible, setIsVisible ] = useState(false);
    const [ isReady, setIsReady ] = useState(false);
    const [ isCreatorOpen, setCreatorOpen ] = useState(false);
    const [ isRoomInfoOpen, setRoomInfoOpen ] = useState(false);
    const [ isRoomLinkOpen, setRoomLinkOpen ] = useState(false);
    const [ isLoading, setIsLoading ] = useState(false);
    const [ needsInit, setNeedsInit ] = useState(true);
    const [ needsSearch, setNeedsSearch ] = useState(false);
    const [ categories, setCategories ] = useState<NavigatorCategoryDataParser[]>(null);
    const [ topLevelContext, setTopLevelContext ] = useState<NavigatorTopLevelContext>(null);
    const [ topLevelContexts, setTopLevelContexts ] = useState<NavigatorTopLevelContext[]>(null);
    const [ navigatorData, setNavigatorData ] = useSharedNavigatorData();
    const [ doorData, setDoorData ] = useState<{ roomInfo: RoomDataParser, state: number }>({ roomInfo: null, state: DoorStateType.NONE });
    const [ searchResult, setSearchResult ] = useState<NavigatorSearchResultSet>(null);
    const pendingSearch = useRef<{ value: string, code: string }>(null);

    const onRoomSessionEvent = useCallback((event: RoomSessionEvent) =>
    {
        switch(event.type)
        {
            case RoomSessionEvent.CREATED:
                setIsVisible(false);
                setCreatorOpen(false);
                return;
        }
    }, []);

    UseRoomSessionManagerEvent(RoomSessionEvent.CREATED, onRoomSessionEvent);

    const sendSearch = useCallback((searchValue: string, contextCode: string) =>
    {
        setCreatorOpen(false);

        SendMessageComposer(new NavigatorSearchComposer(contextCode, searchValue));

        setIsLoading(true);
    }, []);

    const reloadCurrentSearch = useCallback(() =>
    {
        if(!isReady)
        {
            setNeedsSearch(true);
            
            return;
        }

        if(pendingSearch.current)
        {
            sendSearch(pendingSearch.current.value, pendingSearch.current.code);

            pendingSearch.current = null;

            return;
        }

        if(searchResult)
        {
            sendSearch(searchResult.data, searchResult.code);

            return;
        }

        if(!topLevelContext) return;
        
        sendSearch('', topLevelContext.code);
    }, [ isReady, searchResult, topLevelContext, sendSearch ]);

    const linkReceived = useCallback((url: string) =>
    {
        const parts = url.split('/');

        if(parts.length < 2) return;

        switch(parts[1])
        {
            case 'show': {
                setIsVisible(true);
                setNeedsSearch(true);
                return;
            }
            case 'hide':
                setIsVisible(false);
                return;
            case 'toggle': {
                if(isVisible)
                {
                    setIsVisible(false);

                    return;
                }

                setIsVisible(true);
                setNeedsSearch(true);
                return;
            }
            case 'toggle-room-info':
                setRoomInfoOpen(value => !value);
                return;
            case 'toggle-room-link':
                setRoomLinkOpen(value => !value);
                return;
            case 'goto':
                if(parts.length <= 2) return;

                switch(parts[2])
                {
                    case 'home':
                        if(navigatorData.homeRoomId <= 0) return;

                        TryVisitRoom(navigatorData.homeRoomId);
                        break;
                    default: {
                        const roomId = parseInt(parts[2]);

                        TryVisitRoom(roomId);
                    }
                }
                return;
            case 'create':
                setIsVisible(true);
                setCreatorOpen(true);
                return;
            case 'search':
                if(parts.length > 2)
                {
                    const topLevelContextCode = parts[2];

                    let searchValue = '';

                    if(parts.length > 3) searchValue = parts[3];

                    pendingSearch.current = { value: searchValue, code: topLevelContextCode };

                    setIsVisible(true);
                    setNeedsSearch(true);
                }
                return;
        } 
    }, [ isVisible, navigatorData ]);

    useEffect(() =>
    {
        const linkTracker: ILinkEventTracker = {
            linkReceived,
            eventUrlPrefix: 'navigator/'
        };

        AddEventLinkTracker(linkTracker);

        return () => RemoveLinkEventTracker(linkTracker);
    }, [ linkReceived ]);

    useEffect(() =>
    {
        if(!searchResult) return;

        setIsLoading(false);
    }, [ searchResult ]);

    useEffect(() =>
    {
        if(!isVisible || !isReady || !needsSearch) return;

        reloadCurrentSearch();

        setNeedsSearch(false);
    }, [ isVisible, isReady, needsSearch, reloadCurrentSearch ]);

    useEffect(() =>
    {
        if(isReady || !topLevelContext) return;

        setIsReady(true);
    }, [ isReady, topLevelContext ]);

    useEffect(() =>
    {
        if(!isVisible || !needsInit) return;

        SendMessageComposer(new NavigatorInitComposer());

        setNeedsInit(false);
    }, [ isVisible, needsInit ]);

    useEffect(() =>
    {
        LegacyExternalInterface.addCallback(HabboWebTools.OPENROOM, (k: string, _arg_2: boolean = false, _arg_3: string = null) => SendMessageComposer(new ConvertGlobalRoomIdMessageComposer(k)));
    }, []);

    return (
        <NavigatorContextProvider value={ { categories, setCategories, topLevelContext, setTopLevelContext, topLevelContexts, setTopLevelContexts, navigatorData, setNavigatorData, doorData, setDoorData, searchResult, setSearchResult } }>
            <NavigatorMessageHandler />
            { isVisible &&
                <NitroCardView uniqueKey="navigator" className="nitro-navigator">
                    <div className="drag-handler" >
                        <div style={{padding: "10px", fontSize: "21px", fontWeight: "bold", color: "var(--test-galaxytext)", display: "inline-block"}}>Navegador</div>
                        { topLevelContexts && (topLevelContexts.length > 0) && topLevelContexts.map((context, index) =>
                            {
                                return (
                                    <div style={{display: "inline-block", backgroundColor: "var(--test-galaxytwo)", padding: "4px", borderRadius: "4px", marginRight: "5px", cursor: "pointer"}} onClick={ event => sendSearch('', context.code) }>
                                        { LocalizeText(('navigator.toplevelview.' + context.code)) }
                                    </div>
                                );
                            }) 
                        }
                        <div style={{display: "inline-block", float: "right", padding: "13px"}}>
                            <div onClick={() => setCreatorOpen(true)} style={{display: "inline-block", backgroundColor: "#1dbf4a", padding: "4px", borderRadius: "4px", marginRight: "2px", cursor: "pointer"}}>
                                <FontAwesomeIcon icon="plus" /> Crear sala
                            </div> &nbsp;
                            <div style={{display: "inline-block", backgroundColor: "#a61c1c", padding: "4px", borderRadius: "4px", marginRight: "2px", cursor: "pointer"}} onClick={() => setIsVisible(!isVisible)}>
                                <FontAwesomeIcon icon="times" />
                            </div>
                        </div>
                    </div>
                    <NitroCardContentView position="relative">
                        { isLoading &&
                            <Base fit position="absolute" className="top-0 start-0 z-index-1 bg-muted opacity-0-5" /> }
                        { !isCreatorOpen &&
                            <>
                               <NavigatorSearchView sendSearch={ sendSearch } />
                                <Column overflow="auto">
                                    { (searchResult && searchResult.results.map((result, index) => <NavigatorSearchResultView key={ index } searchResult={ result } />)) }
                                </Column>
                            </> }
                        { isCreatorOpen && <NavigatorRoomCreatorView /> }
                    </NitroCardContentView>
                </NitroCardView> }
            <NavigatorDoorStateView />
            { isRoomInfoOpen && <NavigatorRoomInfoView onCloseClick={ () => setRoomInfoOpen(false) } /> }
            { isRoomLinkOpen && <NavigatorRoomLinkView onCloseClick={ () => setRoomLinkOpen(false) } /> }
            <NavigatorRoomSettingsView />
        </NavigatorContextProvider>
    );
}
