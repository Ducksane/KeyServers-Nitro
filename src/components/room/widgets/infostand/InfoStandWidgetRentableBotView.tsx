import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { BotRemoveComposer } from '@nitrots/nitro-renderer';
import { FC, useMemo } from 'react';
import { LocalizeText, RoomWidgetUpdateInfostandRentableBotEvent, SendMessageComposer } from '../../../../api';
import { Button, Column, Flex, LayoutAvatarImageView, LayoutBadgeImageView, Text, UserProfileIconView } from '../../../../common';
import { BotSkillsEnum } from '../avatar-info/common/BotSkillsEnum';

interface InfoStandWidgetRentableBotViewProps
{
    rentableBotData: RoomWidgetUpdateInfostandRentableBotEvent;
    close: () => void;
}

export const InfoStandWidgetRentableBotView: FC<InfoStandWidgetRentableBotViewProps> = props =>
{
    const { rentableBotData = null, close = null } = props;

    const canPickup = useMemo(() =>
    {
        if(rentableBotData.botSkills.indexOf(BotSkillsEnum.NO_PICK_UP) >= 0) return false;

        if(!rentableBotData.amIOwner && !rentableBotData.amIAnyRoomController) return false;

        return true;
    }, [ rentableBotData ]);

    const pickupBot = () => SendMessageComposer(new BotRemoveComposer(rentableBotData.webID));
    
    if(!rentableBotData) return;

    return (
        <Column gap={ 1 }>
            <Column className="nitro-infostand rounded" style={{backgroundColor: "var(--test-galaxy)"}}>
                <div className="nitro-infostand-title">
                    <Column gap={ 1 }>
                        <Flex alignItems="center" justifyContent="between" gap={ 1 }>
                            <Text variant="none" style={{color: "var(--test-galaxytext)"}} small wrap>{ rentableBotData.name }</Text>
                            <FontAwesomeIcon icon="times" className="cursor-pointer" onClick={ close } />
                        </Flex>
                    </Column>
                </div>
                <Column overflow="visible" className="container-fluid content-area" gap={ 1 }>
                    <Column gap={ 1 }>
                        <Flex gap={ 1 }>
                            <Column fullWidth className="body-image bot">
                                <LayoutAvatarImageView figure={ rentableBotData.figure } direction={ 4 } />
                            </Column>
                            <Column grow center gap={ 0 }>
                                { (rentableBotData.badges.length > 0) && rentableBotData.badges.map(result =>
                                {
                                    return <LayoutBadgeImageView key={ result } badgeCode={ result } showInfo={ true } />;
                                }) }
                            </Column>
                        </Flex>
                        <hr className="m-0" />
                    </Column>
                    <Column gap={ 1 }>
                        <Flex alignItems="center" className="bg-primary rounded py-1 px-2">
                            <FontAwesomeIcon icon="pencil-alt" className="small" style={{marginLeft: "1px"}} /> &nbsp;&nbsp;
                            <Text fullWidth wrap textBreak variant="white" small className="motto-content">{ rentableBotData.motto }</Text>
                        </Flex>
                    </Column>
                    <Column gap={ 1 }>
                        <Flex alignItems="center" className="rounded py-1 px-2" style={{ backgroundColor: "rgb(53, 196, 96)"}}>
                            <Flex alignItems="center" gap={ 1 }>
                                <UserProfileIconView userId={ rentableBotData.ownerId } />
                                <Text variant="white" small wrap>
                                    { LocalizeText('infostand.text.botowner', [ 'name' ], [ rentableBotData.ownerName ]) }
                                </Text>
                            </Flex>
                        </Flex>
                        { (rentableBotData.carryItem > 0) &&
                            <>
                                <Flex alignItems="center" className="rounded py-1 px-2" style={{ backgroundColor: "rgb(209, 82, 84)"}}>
                                    <img src="https://images.habbo.com/c_images/catalogue/icon_70.png"/> &nbsp;
                                    <Text variant="white" small wrap>
                                        { LocalizeText('infostand.text.handitem', [ 'item' ], [ LocalizeText('handitem' + rentableBotData.carryItem) ]) }
                                    </Text>
                                </Flex>
                            </> }
                    </Column>
                </Column>
            </Column>
            { canPickup &&
                <Flex justifyContent="end">
                    <Button variant="none" className="text-white" style={{backgroundColor: "var(--test-galaxytwo)"}} onClick={ pickupBot }>{ LocalizeText('infostand.button.pickup') }</Button>
                </Flex> }
        </Column>
    );
}
