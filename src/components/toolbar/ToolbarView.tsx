import { Dispose, DropBounce, EaseOut, JumpBy, Motions, NitroToolbarAnimateIconEvent, PerkAllowancesMessageEvent, PerkEnum, Queue, Wait } from '@nitrots/nitro-renderer';
import { FC, useCallback, useState } from 'react';
import { CreateLinkEvent, GetSessionDataManager, MessengerIconState, OpenMessengerChat, VisitDesktop } from '../../api';
import { Base, Flex, LayoutAvatarImageView, LayoutItemCountView, TransitionAnimation, TransitionAnimationTypes } from '../../common';
import { ModToolsEvent } from '../../events';
import { DispatchUiEvent, useAchievements, useFriends, useInventoryUnseenTracker, UseMessageEventHook, useMessenger, UseRoomEngineEvent, useSessionInfo } from '../../hooks';
import { ToolbarMeView } from './ToolbarMeView';

export const ToolbarView: FC<{ isInRoom: boolean }> = props =>
{
    const { isInRoom } = props;

    const [ isMeExpanded, setMeExpanded ] = useState(false);
    const [ useGuideTool, setUseGuideTool ] = useState(false);
    const { userFigure = null } = useSessionInfo();
    const { getFullCount = 0 } = useInventoryUnseenTracker();
    const { getTotalUnseen = 0 } = useAchievements();
    const { requests = [] } = useFriends();
    const { iconState = MessengerIconState.HIDDEN } = useMessenger();
    const isMod = GetSessionDataManager().isModerator;

    const onPerkAllowancesMessageEvent = useCallback((event: PerkAllowancesMessageEvent) =>
    {
        const parser = event.getParser();

        setUseGuideTool(parser.isAllowed(PerkEnum.USE_GUIDE_TOOL));
    }, [ setUseGuideTool ]);
    
    UseMessageEventHook(PerkAllowancesMessageEvent, onPerkAllowancesMessageEvent);

    const animationIconToToolbar = useCallback((iconName: string, image: HTMLImageElement, x: number, y: number) =>
    {
        const target = (document.body.getElementsByClassName(iconName)[0] as HTMLElement);

        if(!target) return;
        
        image.className = 'toolbar-icon-animation';
        image.style.visibility = 'visible';
        image.style.left = (x + 'px');
        image.style.top = (y + 'px');

        document.body.append(image);

        const targetBounds = target.getBoundingClientRect();
        const imageBounds = image.getBoundingClientRect();

        const left = (imageBounds.x - targetBounds.x);
        const top = (imageBounds.y - targetBounds.y);
        const squared = Math.sqrt(((left * left) + (top * top)));
        const wait = (500 - Math.abs(((((1 / squared) * 100) * 500) * 0.5)));
        const height = 20;

        const motionName = (`ToolbarBouncing[${ iconName }]`);

        if(!Motions.getMotionByTag(motionName))
        {
            Motions.runMotion(new Queue(new Wait((wait + 8)), new DropBounce(target, 400, 12))).tag = motionName;
        }

        const motion = new Queue(new EaseOut(new JumpBy(image, wait, ((targetBounds.x - imageBounds.x) + height), (targetBounds.y - imageBounds.y), 100, 1), 1), new Dispose(image));

        Motions.runMotion(motion);
    }, []);

    const onNitroToolbarAnimateIconEvent = useCallback((event: NitroToolbarAnimateIconEvent) =>
    {
        animationIconToToolbar('icon-inventory', event.image, event.x, event.y);
    }, [ animationIconToToolbar ]);

    UseRoomEngineEvent(NitroToolbarAnimateIconEvent.ANIMATE_ICON, onNitroToolbarAnimateIconEvent);
    //<Flex alignItems="center" gap={ 2 } style={{ backgroundColor: "var(--test-galaxy)", borderRadius: "0.2rem", marginBottom: "3px",
    return (
        <>
            <TransitionAnimation type={ TransitionAnimationTypes.FADE_IN } inProp={ isMeExpanded } timeout={ 300 }>
                <ToolbarMeView useGuideTool={ useGuideTool } unseenAchievementCount={ getTotalUnseen } setMeExpanded={ setMeExpanded } />
            </TransitionAnimation>
            <Flex alignItems="center" justifyContent="between" gap={ 3 } className="nitro-toolbar py-1 px-3 animate__animated animate__backInUp" style={{marginBottom: "17px"}}>
                <Flex gap={ 2 } alignItems="center">
                    <Flex alignItems="center" gap={ 2 } style={{ marginBottom: "3px",paddingTop: 2, paddingBottom: 2, paddingLeft: 10, paddingRight: 10}}>
                        <Flex style={{borderRadius: "50%", padding: "26px"}} center pointer className={ 'navigation-item item-avatar icon-border ' + (isMeExpanded ? 'active ' : '') } onClick={ event => setMeExpanded(!isMeExpanded) }>
                            <LayoutAvatarImageView figure={ userFigure } direction={ 2 } position="absolute" />
                        </Flex>
                        { isInRoom &&
                            <Base style={{borderRadius: "16px", backgroundColor: "#009688", padding: "25px"}} pointer className="navigation-item icon icon-habbo icon-border message-icon-show" onClick={ event => VisitDesktop() } /> }
                        { !isInRoom &&
                            <Base style={{borderRadius: "26px", backgroundColor: "rgb(33 29 29 / 84%)", padding: "25px"}} pointer className="navigation-item icon icon-house icon-border" onClick={ event => CreateLinkEvent('navigator/goto/home') } /> }
                        <Base style={{borderRadius: "12px", backgroundColor: "rgb(33 29 29 / 84%)", padding: "25px"}} pointer className="navigation-item icon icon-rooms icon-border" onClick={ event => CreateLinkEvent('navigator/toggle') } />
                        <Base style={{borderRadius: "12px", backgroundColor: "rgb(33 29 29 / 84%)", padding: "25px"}} pointer className="navigation-item icon icon-catalog icon-border" onClick={ event => CreateLinkEvent('catalog/toggle') } />
                        <Base style={{borderRadius: "12px", backgroundColor: "rgb(33 29 29 / 84%)", padding: "25px"}} pointer className="navigation-item icon icon-inventory icon-border" onClick={ event => CreateLinkEvent('inventory/toggle') }>
                            { (getFullCount > 0) &&
                                <LayoutItemCountView count={ getFullCount } /> }
                        </Base>
                        { isInRoom &&
                            <Base style={{borderRadius: "16px", backgroundColor: "var(--test-galaxy)", padding: "25px"}} pointer className="navigation-item icon icon-camera icon-border" onClick={ event => CreateLinkEvent('camera/toggle') } /> }
                        { isMod &&
                            <Base style={{borderRadius: "16px", backgroundColor: "var(--test-galaxy)", padding: "25px"}} pointer className="navigation-item icon icon-modtools icon-border" onClick={ event => DispatchUiEvent(new ModToolsEvent(ModToolsEvent.TOGGLE_MOD_TOOLS)) } /> }
                    </Flex>
                </Flex>
                <Flex alignItems="center" id="toolbar-chat-input-container" />
                <Flex alignItems="center" gap={ 2 }>
                    <div style={{ marginBottom: "3px",paddingTop: 6, paddingBottom: 6, paddingLeft: 10, paddingRight: 10}}>
                    <Flex gap={ 2 }>
                        <Base style={{borderRadius: "16px", backgroundColor: "var(--test-galaxy)", padding: "25px"}} pointer className="navigation-item icon icon-friendall icon-border" onClick={ event => CreateLinkEvent('friends/toggle') }>
                            { (requests.length > 0) &&
                                <LayoutItemCountView count={ requests.length } /> }
                        </Base>
                        { ((iconState === MessengerIconState.SHOW) || (iconState === MessengerIconState.UNREAD)) &&
                            <Base style={{borderRadius: "16px", backgroundColor: "var(--test-galaxy)", padding: "25px"}} pointer className={ `navigation-item icon icon-border icon-message  ${ (iconState === MessengerIconState.UNREAD) && 'is-unseen' }` } onClick={ event => OpenMessengerChat() } /> }
                    </Flex>
                    </div>
                    <Base id="toolbar-friend-bar-container" className="d-none d-lg-block" />
                </Flex>
            </Flex>
        </>
    );
}
