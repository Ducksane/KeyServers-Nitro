import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { RoomObjectCategory } from '@nitrots/nitro-renderer';
import { FC } from 'react';
import { LocalizeText, MessengerRequest } from '../../../../api';
import { Base, Button, Column, Flex, Text } from '../../../../common';
import { useFriends } from '../../../../hooks';
import { ObjectLocationView } from '../object-location/ObjectLocationView';

export const FriendRequestDialogView: FC<{ roomIndex: number, request: MessengerRequest, hideFriendRequest: (userId: number) => void }> = props =>
{
    const { roomIndex = -1, request = null, hideFriendRequest = null } = props;
    const { requestResponse = null } = useFriends();

    return (
        <ObjectLocationView objectId={ roomIndex } category={ RoomObjectCategory.UNIT }>
            <Base className="nitro-friend-request-dialog nitro-context-menu p-2">
                <Column>
                    <Flex alignItems="center" justifyContent="between" gap={ 2 }>
                        <Text variant="none" style={{color: "var(--test-galaxytext)"}} fontSize={ 6 }>{ LocalizeText('widget.friendrequest.from', [ 'username' ], [ request.name ]) }</Text>
                        <FontAwesomeIcon icon="times" className="cursor-pointer" onClick={ event => hideFriendRequest(request.requesterUserId) } />
                    </Flex>
                    <Flex justifyContent="end" gap={ 1 }>
                        <Button variant="danger" onClick={ event => requestResponse(request.requesterUserId, false) }>{ LocalizeText('widget.friendrequest.decline') }</Button>
                        <Button variant="success" onClick={ event => requestResponse(request.requesterUserId, true) }>{ LocalizeText('widget.friendrequest.accept') }</Button>
                    </Flex>
                </Column>
            </Base>
        </ObjectLocationView>
    );
}
