import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { RelationshipStatusInfoEvent, RelationshipStatusInfoMessageParser, RoomSessionFavoriteGroupUpdateEvent, RoomSessionUserBadgesEvent, RoomSessionUserFigureUpdateEvent, UserRelationshipsComposer } from '@nitrots/nitro-renderer';
import { Dispatch, FC, FocusEvent, KeyboardEvent, SetStateAction, useCallback, useEffect, useState } from 'react';
import { CloneObject, GetConfiguration, GetGroupInformation, GetSessionDataManager, GetUserProfile, LocalizeText, RoomWidgetChangeMottoMessage, RoomWidgetUpdateInfostandUserEvent, SendMessageComposer } from '../../../../api';
import { Base, Column, Flex, LayoutAvatarImageView, LayoutBadgeImageView, Text, UserProfileIconView } from '../../../../common';
import { UseEventDispatcherHook, UseMessageEventHook } from '../../../../hooks';
import { useRoomContext } from '../../RoomContext';
import { InfoStandWidgetUserRelationshipsView } from './InfoStandWidgetUserRelationshipsView';

interface InfoStandWidgetUserViewProps
{
    userData: RoomWidgetUpdateInfostandUserEvent;
    setUserData: Dispatch<SetStateAction<RoomWidgetUpdateInfostandUserEvent>>;
    close: () => void;
}

export const InfoStandWidgetUserView: FC<InfoStandWidgetUserViewProps> = props =>
{
    const { userData = null, setUserData = null, close = null } = props;
    const [ motto, setMotto ] = useState<string>(null);
    const [ isEditingMotto, setIsEditingMotto ] = useState(false);
    const [ relationships, setRelationships ] = useState<RelationshipStatusInfoMessageParser>(null);
    const { eventDispatcher = null, widgetHandler = null } = useRoomContext();
    const maxBadgeCount = GetConfiguration<number>('user.badges.max.slots', 5);
    const [ bannerUrl, setBannerUrl ] = useState<string>(null)
    const sso = new URLSearchParams(window.location.search).get('sso');

    const saveMotto = (motto: string) =>
    {
        if(!isEditingMotto || (motto.length > GetConfiguration<number>('motto.max.length', 38))) return;

        widgetHandler.processWidgetMessage(new RoomWidgetChangeMottoMessage(motto));

        setIsEditingMotto(false);
    }

    const onMottoBlur = (event: FocusEvent<HTMLInputElement>) => saveMotto(event.target.value);

    const onMottoKeyDown = (event: KeyboardEvent<HTMLInputElement>) =>
    {
        event.stopPropagation();
        
        switch(event.key)
        {
            case 'Enter':
                saveMotto((event.target as HTMLInputElement).value);
                return;
        }
    }

    const onRoomSessionUserBadgesEvent = useCallback((event: RoomSessionUserBadgesEvent) =>
    {
        if(!userData || (userData.webID !== event.userId)) return;

        setUserData(prevValue =>
        {
            const newValue = CloneObject(prevValue);

            newValue.badges = event.badges;

            return newValue;
        });
    }, [ userData, setUserData ]);

    UseEventDispatcherHook(RoomSessionUserBadgesEvent.RSUBE_BADGES, eventDispatcher, onRoomSessionUserBadgesEvent);

    const onRoomSessionUserFigureUpdateEvent = useCallback((event: RoomSessionUserFigureUpdateEvent) =>
    {
        if(!userData || (userData.roomIndex !== event.roomIndex)) return;

        setUserData(prevValue =>
        {
            const newValue = CloneObject(prevValue);

            newValue.figure = event.figure;
            newValue.motto = event.customInfo;
            newValue.achievementScore = event.activityPoints;

            return newValue;
        });
    }, [ userData, setUserData ]);

    UseEventDispatcherHook(RoomSessionUserFigureUpdateEvent.USER_FIGURE, eventDispatcher, onRoomSessionUserFigureUpdateEvent);

    const onRoomSessionFavoriteGroupUpdateEvent = useCallback((event: RoomSessionFavoriteGroupUpdateEvent) =>
    {
        if(!userData || (userData.roomIndex !== event.roomIndex)) return;

        setUserData(prevValue =>
        {
            const newValue = CloneObject(prevValue);

            const clearGroup = ((event.status === -1) || (event.habboGroupId <= 0));

            newValue.groupId = clearGroup ? -1 : event.habboGroupId;
            newValue.groupName = clearGroup ? null : event.habboGroupName
            newValue.groupBadgeId = clearGroup ? null : GetSessionDataManager().getGroupBadge(event.habboGroupId);

            return newValue;
        });
    }, [ userData, setUserData ]);

    UseEventDispatcherHook(RoomSessionFavoriteGroupUpdateEvent.FAVOURITE_GROUP_UPDATE, eventDispatcher, onRoomSessionFavoriteGroupUpdateEvent);

    const onUserRelationshipsEvent = useCallback((event: RelationshipStatusInfoEvent) =>
    {
        const parser = event.getParser();

        if(!userData || (userData.webID !== parser.userId)) return;

        setRelationships(parser);
    }, [ userData ]);

    UseMessageEventHook(RelationshipStatusInfoEvent, onUserRelationshipsEvent);

    useEffect(() =>
    {
        setIsEditingMotto(false);
        setMotto(userData.motto);
        
        SendMessageComposer(new UserRelationshipsComposer(userData.webID));
        fetch("https://int.lavvos.eu/?type=getbanner&sso=" + sso + "&username=" + userData.name)
            .then((response) => response.text())
            .then((result) => {
                if(result == null || result == "ERROR") setBannerUrl("https://lavvos.eu/swfs/banners/banner1.png");
                else setBannerUrl("https://lavvos.eu/swfs/banners/banner" + result.replace(/\n/g, "") + ".png");
            })

        return () => 
        {
            setIsEditingMotto(false);
            setMotto(null);
            setRelationships(null);
        }
    }, [ userData ]);

    if(!userData) return null;

    return (
        <Column className="nitro-infostand rounded" style={{backgroundColor: "var(--test-galaxy)"}}>
            <div className="nitro-infostand-title">
                <Column gap={ 1 }>
                    <Flex alignItems="center" justifyContent="between">
                        <Flex alignItems="center" gap={ 1 }>
                            <UserProfileIconView userId={ userData.webID } />
                            <Text variant="none" style={{color: "var(--test-galaxytext)"}} small wrap>{ userData.name }</Text>
                        </Flex>
                        <FontAwesomeIcon icon="times" className="cursor-pointer" onClick={ close } />
                    </Flex>
                </Column>
            </div>
            <Column overflow="visible" className="container-fluid content-area" gap={ 1 }>
                <Column gap={ 1 }>
                    <Flex gap={ 1 }>
                    <Column fullWidth className="body-image" onClick={ event => GetUserProfile(userData.webID) } style={{ backgroundImage: `url(` + bannerUrl + `)`, borderRadius: "10px"}}>
                            <LayoutAvatarImageView figure={ userData.figure } direction={ 4 } />
                        </Column>
                        <Column grow gap={ 0 }>
                            <Flex gap={ 1 }>
                                <Base className="badge-image">
                                    { userData.badges[0] && <LayoutBadgeImageView badgeCode={ userData.badges[0] } showInfo={ true } /> }
                                </Base>
                                <Base pointer={ ( userData.groupId > 0) } className="badge-image" onClick={ event => GetGroupInformation(userData.groupId) }>
                                    { userData.groupId > 0 &&
                                        <LayoutBadgeImageView badgeCode={ userData.groupBadgeId } isGroup={ true } showInfo={ true } customTitle={ userData.groupName } /> }
                                </Base>
                            </Flex>
                            <Flex gap={ 1 }>
                                <Base className="badge-image">
                                    { userData.badges[1] && <LayoutBadgeImageView badgeCode={ userData.badges[1] } showInfo={ true } /> }
                                </Base>
                                <Base className="badge-image">
                                    { userData.badges[2] && <LayoutBadgeImageView badgeCode={ userData.badges[2] } showInfo={ true } /> }
                                </Base>
                            </Flex>
                            <Flex gap={ 1 }>
                                <Base className="badge-image">
                                    { userData.badges[3] && <LayoutBadgeImageView badgeCode={ userData.badges[3] } showInfo={ true } /> }
                                </Base>
                                <Base className="badge-image">
                                    { userData.badges[4] && <LayoutBadgeImageView badgeCode={ userData.badges[4] } showInfo={ true } /> }
                                </Base>
                            </Flex>
                        </Column>
                    </Flex>
                    <hr className="m-0" />
                </Column>
                <Column gap={ 1 }>
                    <Flex alignItems="center" className="bg-primary rounded py-1 px-2">
                        { (userData.type !== RoomWidgetUpdateInfostandUserEvent.OWN_USER) &&
                            <Flex grow alignItems="center" gap={ 2 }>
                                <FontAwesomeIcon icon="pencil-alt" className="small" style={{marginLeft: "1px"}} />
                                <Flex grow alignItems="center" className="motto-content">
                                    <Text fullWidth pointer wrap textBreak small variant="white">{ motto }</Text>
                                </Flex> 
                            </Flex>}
                        { userData.type === RoomWidgetUpdateInfostandUserEvent.OWN_USER &&
                            <Flex grow alignItems="center" gap={ 2 }>
                                <FontAwesomeIcon icon="pencil-alt" className="small" style={{marginLeft: "1px"}} />
                                <Flex grow alignItems="center" className="motto-content">
                                    { !isEditingMotto &&
                                        <Text fullWidth pointer wrap textBreak small variant="white" onClick={ event => setIsEditingMotto(true) }>{ motto }&nbsp;</Text> }
                                    { isEditingMotto &&
                                        <input type="text" className="motto-input" maxLength={ GetConfiguration<number>('motto.max.length', 38) } value={ motto } onChange={ event => setMotto(event.target.value) } onBlur={ onMottoBlur } onKeyDown={ onMottoKeyDown } autoFocus={ true } /> }
                                </Flex>
                            </Flex> }
                    </Flex>
                    <hr className="m-0" />
                </Column>
                <Column gap={ 1 }>
                    <Flex alignItems="center" className="rounded py-1 px-2" style={{backgroundColor: "#35c460"}}>
                        <img src="https://images.habbo.com/c_images/catalogue/icon_256.png"/> &nbsp;
                        <Text variant="white" small wrap>
                            { LocalizeText('infostand.text.achievement_score') + ' ' + userData.achievementScore }
                        </Text>
                    </Flex>
                    { (userData.carryItem > 0) &&
                        <>
                            <Flex alignItems="center" className="rounded py-1 px-2" style={{backgroundColor: "#d15254"}}>
                                <img src="https://images.habbo.com/c_images/catalogue/icon_70.png"/> &nbsp;
                                <Text variant="white" small wrap>
                                    { LocalizeText('infostand.text.handitem', [ 'item' ], [ LocalizeText('handitem' + userData.carryItem) ]) }
                                </Text>
                            </Flex>
                        </> }
                </Column>
                <Column gap={ 1 }>
                    <InfoStandWidgetUserRelationshipsView relationships={ relationships } />
                </Column>
            </Column>
        </Column>
    );
}
