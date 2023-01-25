import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { BadgePointLimitsEvent, ILinkEventTracker, IRoomSession, RoomEngineObjectEvent, RoomEngineObjectPlacedEvent, RoomPreviewer, RoomSessionEvent } from '@nitrots/nitro-renderer';
import { FC, useCallback, useEffect, useState } from 'react';
import { AddEventLinkTracker, GetLocalization, GetRoomEngine, LocalizeText, RemoveLinkEventTracker, UnseenItemCategory } from '../../api';
import { isObjectMoverRequested, setObjectMoverRequested } from '../../api/inventory/InventoryUtilities';
import { NitroCardContentView, NitroCardHeaderView, NitroCardView } from '../../common';
import { useInventoryTrade, useInventoryUnseenTracker, UseMessageEventHook, UseRoomEngineEvent, UseRoomSessionManagerEvent } from '../../hooks';
import { InventoryBadgeView } from './views/badge/InventoryBadgeView';
import { InventoryBotView } from './views/bot/InventoryBotView';
import { InventoryFurnitureView } from './views/furniture/InventoryFurnitureView';
import { InventoryTradeView } from './views/furniture/InventoryTradeView';
import { InventoryPetView } from './views/pet/InventoryPetView';

const TAB_FURNITURE: string = 'inventory.furni';
const TAB_BOTS: string = 'inventory.bots';
const TAB_PETS: string = 'inventory.furni.tab.pets';
const TAB_BADGES: string = 'inventory.badges';
const TABS = [ TAB_FURNITURE, TAB_BOTS, TAB_PETS, TAB_BADGES ];
const UNSEEN_CATEGORIES = [ UnseenItemCategory.FURNI, UnseenItemCategory.BOT, UnseenItemCategory.PET, UnseenItemCategory.BADGE ];

export const InventoryView: FC<{}> = props =>
{
    const [ isVisible, setIsVisible ] = useState(false);
    const [ currentTab, setCurrentTab ] = useState<string>(TABS[0]);
    const [ roomSession, setRoomSession ] = useState<IRoomSession>(null);
    const [ roomPreviewer, setRoomPreviewer ] = useState<RoomPreviewer>(null);
    const { isTrading = false, stopTrading = null } = useInventoryTrade();
    const { getCount = null, resetCategory = null } = useInventoryUnseenTracker();

    const close = () =>
    {
        if(isTrading) stopTrading();

        setIsVisible(false);
    }

    const onRoomEngineObjectPlacedEvent = useCallback((event: RoomEngineObjectPlacedEvent) =>
    {
        if(!isObjectMoverRequested()) return;

        setObjectMoverRequested(false);

        if(!event.placedInRoom) setIsVisible(true);
    }, []);

    UseRoomEngineEvent(RoomEngineObjectEvent.PLACED, onRoomEngineObjectPlacedEvent);

    const onRoomSessionEvent = useCallback((event: RoomSessionEvent) =>
    {
        switch(event.type)
        {
            case RoomSessionEvent.CREATED:
                setRoomSession(event.session);
                return;
            case RoomSessionEvent.ENDED:
                setRoomSession(null);
                setIsVisible(false);
                return;
        }
    }, []);

    UseRoomSessionManagerEvent(RoomSessionEvent.CREATED, onRoomSessionEvent);
    UseRoomSessionManagerEvent(RoomSessionEvent.ENDED, onRoomSessionEvent);

    const onBadgePointLimitsEvent = useCallback((event: BadgePointLimitsEvent) =>
    {
        const parser = event.getParser();

        for(const data of parser.data) GetLocalization().setBadgePointLimit(data.badgeId, data.limit);
    }, []);

    UseMessageEventHook(BadgePointLimitsEvent, onBadgePointLimitsEvent);

    useEffect(() =>
    {
        const linkTracker: ILinkEventTracker = {
            linkReceived: (url: string) =>
            {
                const parts = url.split('/');

                if(parts.length < 2) return;
        
                switch(parts[1])
                {
                    case 'show':
                        setIsVisible(true);
                        return;
                    case 'hide':
                        setIsVisible(false);
                        return;
                    case 'toggle':
                        setIsVisible(prevValue => !prevValue);
                        return;
                }
            },
            eventUrlPrefix: 'inventory/'
        };

        AddEventLinkTracker(linkTracker);

        return () => RemoveLinkEventTracker(linkTracker);
    }, []);

    useEffect(() =>
    {
        setRoomPreviewer(new RoomPreviewer(GetRoomEngine(), ++RoomPreviewer.PREVIEW_COUNTER));

        return () =>
        {
            setRoomPreviewer(prevValue =>
            {
                prevValue.dispose();

                return null;
            });
        }
    }, []);

    useEffect(() =>
    {
        if(!isVisible && isTrading) setIsVisible(true);
    }, [ isVisible, isTrading ]);

    if(!isVisible) return null;

    return (
        <NitroCardView uniqueKey={ 'inventory' } className="nitro-inventory" theme={ isTrading ? 'primary-slim' : '' } >

            { !isTrading &&
                <>
                    <div className="drag-handler" >
                        <div style={{padding: "10px", fontSize: "21px", fontWeight: "bold", color: "var(--test-galaxytext)", display: "inline-block"}}>Inventario</div>
                            { TABS.map((name, index) =>
                            {
                                return (
                                    <div style={{display: "inline-block", backgroundColor: "var(--test-galaxytwo)", padding: "4px", borderRadius: "4px", marginRight: "5px", cursor: "pointer"}} onClick={ event => setCurrentTab(name) }>
                                        { LocalizeText(name) }
                                    </div>
                                );
                            }) }

                        <div style={{display: "inline-block", float: "right", padding: "13px"}}>
                            <div style={{display: "inline-block", backgroundColor: "#a61c1c", padding: "4px", borderRadius: "4px", marginRight: "2px", cursor: "pointer"}} onClick={() => setIsVisible(!isVisible)}>
                                <FontAwesomeIcon icon="times" />
                            </div>
                        </div>
                        <NitroCardContentView>
                            <div className="height-fix">
                            { (currentTab === TAB_FURNITURE ) &&
                                <InventoryFurnitureView roomSession={ roomSession } roomPreviewer={ roomPreviewer } /> }
                            { (currentTab === TAB_BOTS ) &&
                                <InventoryBotView roomSession={ roomSession } roomPreviewer={ roomPreviewer } /> }
                            { (currentTab === TAB_PETS ) && 
                                <InventoryPetView roomSession={ roomSession } roomPreviewer={ roomPreviewer } /> }
                            { (currentTab === TAB_BADGES ) && 
                                <InventoryBadgeView /> }
                            </div>
                        </NitroCardContentView>
                    </div>
                </> }
            { isTrading &&
                <>
                    <NitroCardHeaderView headerText={ LocalizeText('inventory.title') } onCloseClick={ close } />
                    <NitroCardContentView>
                        <InventoryTradeView cancelTrade={ close } />
                    </NitroCardContentView>
                </> }
        </NitroCardView>
    );
}
