import { MouseEventType } from '@nitrots/nitro-renderer';
import { FC, useEffect, useRef, useState } from 'react';
import { GetUserProfile, LocalizeText, MessengerFriend, OpenMessengerChat } from '../../../../api';
import { Base, LayoutAvatarImageView, LayoutBadgeImageView } from '../../../../common';
import { useFriends } from '../../../../hooks';

export const FriendBarItemView: FC<{ friend: MessengerFriend }> = props =>
{
    const { friend = null } = props;
    const [ isVisible, setVisible ] = useState(false);
    const { followFriend = null } = useFriends();
    const elementRef = useRef<HTMLDivElement>();

    useEffect(() =>
    {
        const onClick = (event: MouseEvent) =>
        {
            const element = elementRef.current;

            if(!element) return;

            if((event.target !== element) && !element.contains((event.target as Node)))
            {
                setVisible(false);
            }
        }

        document.addEventListener(MouseEventType.MOUSE_CLICK, onClick);

        return () => document.removeEventListener(MouseEventType.MOUSE_CLICK, onClick);
    }, []);

    if(!friend)
    {
        return (
            <div style={{backgroundColor: "var(--test-galaxytwo)"}} ref={ elementRef } className="btn btn-lg friend-bar-item friend-bar-search">
                <img className="position-absolute" style={{left: "2px", top: "2px"}} src="https://lavvos.eu/swfs/images/head.png"/>
                <div className="text-truncate" style={{fontSize: "15px", marginTop: "3px", marginBottom: "3px", marginLeft: "3px"}}>{ LocalizeText('friend.bar.find.title') }</div>
            </div>
        );
    }

    return (
        <div style={{backgroundColor: "#15507c"}} ref={ elementRef } className={ 'btn friend-bar-item btn-lg ' + (isVisible ? 'friend-bar-item-active' : '') } onMouseOver={e => setVisible(prevValue => !prevValue)} onMouseOut={e => setVisible(prevValue => !prevValue)}>
            <div className={ `friend-bar-item-head position-absolute ${ friend.id > 0 ? 'avatar': 'group' }` }>
                { (friend.id > 0) && <LayoutAvatarImageView className="image-friendzone" figure={ friend.figure } direction={ 2 } /> }
                { (friend.id <= 0) && <LayoutBadgeImageView isGroup={ true } badgeCode={ friend.figure } /> } 
            </div>
            <div className="text-truncate" style={{fontSize: "15px", marginTop: "3px", marginBottom: "3px", marginLeft: "7px"}}>{ friend.name }</div>
            { isVisible &&
            <div className="d-flex justify-content-between">
                <Base className="nitro-friends-spritesheet icon-friendbar-chat cursor-pointer" onClick={ event => OpenMessengerChat(friend.id) } />
                { friend.followingAllowed &&
                <Base className="nitro-friends-spritesheet icon-friendbar-visit cursor-pointer" onClick={ event => followFriend(friend) } /> }
                <Base className="nitro-friends-spritesheet icon-profile cursor-pointer" onClick={ event => GetUserProfile(friend.id) } />
            </div> }
        </div>
    );
}
