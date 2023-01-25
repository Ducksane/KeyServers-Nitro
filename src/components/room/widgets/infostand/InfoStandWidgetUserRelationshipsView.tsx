import { RelationshipStatusEnum, RelationshipStatusInfoMessageParser } from '@nitrots/nitro-renderer';
import { FC } from 'react';
import { GetUserProfile, LocalizeText } from '../../../../api';
import { Flex, Text } from '../../../../common';

interface InfoStandWidgetUserRelationshipsViewProps
{
    relationships: RelationshipStatusInfoMessageParser;
}

interface InfoStandWidgetUserRelationshipsRelationshipViewProps
{
    type: number;
}

export const InfoStandWidgetUserRelationshipsView: FC<InfoStandWidgetUserRelationshipsViewProps> = props =>
{
    const { relationships = null } = props;

    const RelationshipComponent = ({ type }: InfoStandWidgetUserRelationshipsRelationshipViewProps) =>
    {
        const relationshipInfo = (relationships && relationships.relationshipStatusMap.hasKey(type)) ? relationships.relationshipStatusMap.getValue(type) : null;

        if(!relationshipInfo || !relationshipInfo.friendCount) return null;

        const relationshipName = RelationshipStatusEnum.RELATIONSHIP_NAMES[type].toLocaleLowerCase();

        return (
            <Flex alignItems="center" gap={ 1 } style={{backgroundColor: "#7d7d7d", padding: 5}}>
                <i className={ `nitro-friends-spritesheet icon-${ relationshipName }` } />
                    <Text small variant="none" style={{color: "var(--test-galaxytext)"}} onClick={ event => GetUserProfile(relationshipInfo.randomFriendId) }>
                        { relationshipInfo.randomFriendName }
                        { (relationshipInfo.friendCount > 1) && (' ' + LocalizeText(`extendedprofile.relstatus.others.${ relationshipName }`, [ 'count' ], [ (relationshipInfo.friendCount - 1).toString() ])) }
                    </Text>
            </Flex>
        );
    }

    return (
        <>
            <RelationshipComponent type={ RelationshipStatusEnum.HEART } />
            <RelationshipComponent type={ RelationshipStatusEnum.SMILE } />
            <RelationshipComponent type={ RelationshipStatusEnum.BOBBA } />
        </>
    );
}
