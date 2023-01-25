import { HabboWebTools, RoomSessionEvent } from '@nitrots/nitro-renderer';
import { FC, useCallback, useEffect, useState } from 'react';
import { AddEventLinkTracker, GetCommunication, RemoveLinkEventTracker } from '../../api';
import { Base, TransitionAnimation, TransitionAnimationTypes } from '../../common';
import { UseRoomSessionManagerEvent } from '../../hooks';
import { AchievementsView } from '../achievements/AchievementsView';
import { AvatarEditorView } from '../avatar-editor/AvatarEditorView';
import { BannersMenuView } from '../banners/BannersMenuView';
import { BattlePassView } from '../battlepass/BattlePassView';
import { BawToolView } from '../bawtool/BawToolView';
import { CameraWidgetView } from '../camera/CameraWidgetView';
import { CampaignView } from '../campaign/CampaignView';
import { CasinoView } from '../casino/CasinoView';
import { CatalogView } from '../catalog/CatalogView';
import { ChatHistoryView } from '../chat-history/ChatHistoryView';
import { FloorplanEditorView } from '../floorplan-editor/FloorplanEditorView';
import { FriendsView } from '../friends/FriendsView';
import { GalertsView } from '../galerts/GalertsView';
import { GroupsView } from '../groups/GroupsView';
import { GuideToolView } from '../guide-tool/GuideToolView';
import { HcCenterView } from '../hc-center/HcCenterView';
import { HelpView } from '../help/HelpView';
import { HotelView } from '../hotel-view/HotelView';
import { InventoryView } from '../inventory/InventoryView';
import { MediaRoomView } from '../mediaroom/MediaRoomView';
import { ModToolsView } from '../mod-tools/ModToolsView';
import { NavigatorView } from '../navigator/NavigatorView';
import { NitropediaView } from '../nitropedia/NitropediaView';
import { RareCatalogView } from '../rare-catalog/RareCatalogView';
import { RightSideView } from '../right-side/RightSideView';
import { RoomView } from '../room/RoomView';
import { ToolbarView } from '../toolbar/ToolbarView';
import { UpsideView } from '../upside/UpsideView';
import { UserProfileView } from '../user-profile/UserProfileView';
import { UserSettingsView } from '../user-settings/UserSettingsView';
import { WelcomeWizardView } from '../welcome-wizard/WelcomeWizardView';
import { WiredView } from '../wired/WiredView';

export const MainView: FC<{}> = props =>
{
    const [ isReady, setIsReady ] = useState(false);
    const [ landingViewVisible, setLandingViewVisible ] = useState(true);
    const sso = new URLSearchParams(window.location.search).get('sso');

    function loadColors(){
        fetch("https://int.lavvos.eu/?type=getColors&sso=" + sso)
            .then((response) => response.json())
            .then((result) => 
            {
                document.querySelector('html').style.setProperty('--test-galaxy', result.color_primary);
                document.querySelector('html').style.setProperty('--test-galaxytext', result.color_text);
                document.querySelector('html').style.setProperty('--test-galaxytwo', result.color_secondary);
            })
    }

    loadColors();

    const onRoomSessionEvent = useCallback((event: RoomSessionEvent) =>
    {
        switch(event.type)
        {
            case RoomSessionEvent.CREATED:
                setLandingViewVisible(false);
                return;
            case RoomSessionEvent.ENDED:
                setLandingViewVisible(event.openLandingView);
                return;
        }
    }, []);

    UseRoomSessionManagerEvent(RoomSessionEvent.CREATED, onRoomSessionEvent);
    UseRoomSessionManagerEvent(RoomSessionEvent.ENDED, onRoomSessionEvent);

    const onLinkReceived = useCallback((link: string) =>
    {
        const parts = link.split('/');

        if(parts.length < 2) return;

        switch(parts[1])
        {
            case 'open':
                if(parts.length > 2)
                {
                    switch(parts[2])
                    {
                        case 'credits':
                            //HabboWebTools.openWebPageAndMinimizeClient(this._windowManager.getProperty(ExternalVariables.WEB_SHOP_RELATIVE_URL));
                            break;
                        default: {
                            const name = parts[2];
                            HabboWebTools.openHabblet(name);
                        }
                    }
                }
                return;
        }
    }, []);

    useEffect(() =>
    {
        setIsReady(true);

        GetCommunication().connection.onReady();
    }, []);

    useEffect(() =>
    {
        const linkTracker = { linkReceived: onLinkReceived, eventUrlPrefix: 'habblet/' };
        AddEventLinkTracker(linkTracker);

        return () =>
        {
            RemoveLinkEventTracker(linkTracker);
        }
    }, [ onLinkReceived ]);

    return (
        <Base fit>
            <TransitionAnimation type={ TransitionAnimationTypes.FADE_IN } inProp={ landingViewVisible } timeout={ 300 }>
                <HotelView />
            </TransitionAnimation>
            <ToolbarView isInRoom={ !landingViewVisible } />
            <ModToolsView />
            <RoomView />
            <ChatHistoryView />
            <WiredView />
            <AvatarEditorView />
            <AchievementsView />
            <NavigatorView />
            <InventoryView />
            <CatalogView />
            <FriendsView />
            <UpsideView/>
            <RightSideView />
            <UserSettingsView />
            <UserProfileView />
            <GroupsView />
            <CameraWidgetView />
            <HelpView />
            <FloorplanEditorView />
            <NitropediaView />
            <GuideToolView />
            <HcCenterView />
            <CampaignView />
            <BannersMenuView />
            <BawToolView />
            <CasinoView />
            <BattlePassView />
            <GalertsView />
            <WelcomeWizardView />
            <RareCatalogView />
            <MediaRoomView />
        </Base>
    );
}
