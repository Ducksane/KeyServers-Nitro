import { FriendlyTime, RequestFriendComposer, UserProfileParser } from '@nitrots/nitro-renderer';
import { FC, useEffect, useState } from 'react';
import { GetSessionDataManager, LocalizeText, SendMessageComposer } from '../../../api';
import { Column, Flex, LayoutAvatarImageView, Text } from '../../../common';

interface UserContainerViewProps
{
    userProfile: UserProfileParser;
}

export const UserContainerView: FC<UserContainerViewProps> = props =>
{
    const { userProfile = null } = props;
    const [ requestSent, setRequestSent ] = useState(userProfile.requestSent);
    const isOwnProfile = (userProfile.id === GetSessionDataManager().userId);
    const canSendFriendRequest = !requestSent && (!isOwnProfile && !userProfile.isMyFriend && !userProfile.requestSent);

    const addFriend = () =>
    {
        setRequestSent(true);

        SendMessageComposer(new RequestFriendComposer(userProfile.username));
    }

    useEffect(() =>
    {
        setRequestSent(userProfile.requestSent);
    }, [ userProfile ])

    return (
        <Flex gap={ 2 }>
            <Column center className="avatar-container">
                <LayoutAvatarImageView figure={ userProfile.figure } direction={ 2 } />
            </Column>
            <Column>
                <Column gap={ 0 }>
                    <Text style={{color: "var(--test-galaxytext)"}} variant="none" bold>{ userProfile.username }</Text>
                    <Text style={{color: "var(--test-galaxytext)"}} variant="none" italics textBreak small>{ userProfile.motto }&nbsp;</Text>
                </Column>
                <Column gap={ 1 }>
                    <Text style={{color: "var(--test-galaxytext)"}} variant="none" small>
                        <b>{ LocalizeText('extendedprofile.created') }</b> { userProfile.registration }
                    </Text>
                    <Text style={{color: "var(--test-galaxytext)"}} variant="none" small>
                        <b>{ LocalizeText('extendedprofile.last.login') }</b> { FriendlyTime.format(userProfile.secondsSinceLastVisit, '.ago', 2) }
                    </Text>
                    <Text style={{color: "var(--test-galaxytext)"}} variant="none" small>
                        <b>{ LocalizeText('extendedprofile.achievementscore') }</b> { userProfile.achievementPoints }
                    </Text>
                </Column>
                <Flex gap={ 1 }>
                    { userProfile.isOnline &&
                        <i className="icon icon-pf-online" /> }
                    { !userProfile.isOnline &&
                        <i className="icon icon-pf-offline" /> }
                    <Flex alignItems="center" gap={ 1 }>
                        { canSendFriendRequest &&
                            <Text style={{color: "var(--test-galaxytext)"}} variant="none" small underline pointer onClick={ addFriend }>{ LocalizeText('extendedprofile.addasafriend') }</Text> }
                        { !canSendFriendRequest &&
                            <>
                                <i className="icon icon-pf-tick" />
                                { isOwnProfile &&
                                    <Text style={{color: "var(--test-galaxytext)"}} variant="none">{ LocalizeText('extendedprofile.me') }</Text> }
                                { userProfile.isMyFriend &&
                                    <Text style={{color: "var(--test-galaxytext)"}} variant="none">{ LocalizeText('extendedprofile.friend') }</Text> }
                                { (requestSent || userProfile.requestSent) &&
                                    <Text style={{color: "var(--test-galaxytext)"}} variant="none">{ LocalizeText('extendedprofile.friendrequestsent') }</Text> }
                            </> }
                    </Flex>
                </Flex>
            </Column>
        </Flex>
    )
}
