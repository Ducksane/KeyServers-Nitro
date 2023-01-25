import { FriendlyTime, HabboClubLevelEnum } from '@nitrots/nitro-renderer';
import { FC, useCallback, useMemo } from 'react';
import { CreateLinkEvent, GetConfiguration, LocalizeText } from '../../api';
import { Column } from '../../common';
import { usePurse } from '../../hooks';

export const PurseView: FC<{}> = props =>
{
    const { purse = null, hcDisabled = false } = usePurse();
    const displayedCurrencies = useMemo(() => GetConfiguration<number[]>('system.currency.types', []), []);
    const currencyDisplayNumberShort = useMemo(() => GetConfiguration<boolean>('currency.display.number.short', false), []);

    const getClubText = useMemo(() =>
    {
        if(!purse) return null;

        const totalDays = ((purse.clubPeriods * 31) + purse.clubDays);
        const minutesUntilExpiration = purse.minutesUntilExpiration;

        if(purse.clubLevel === HabboClubLevelEnum.NO_CLUB) return LocalizeText('purse.clubdays.zero.amount.text');

        else if((minutesUntilExpiration > -1) && (minutesUntilExpiration < (60 * 24))) return FriendlyTime.shortFormat(minutesUntilExpiration * 60);
        
        else return FriendlyTime.shortFormat(totalDays * 86400);
    }, [ purse ]);

    function getUrlCurrency(type){
        return "https://lavvos.eu/swfs/monedas/" + type + ".png";
    }

    const getCurrencyElements = useCallback((offset: number, limit: number = -1, seasonal: boolean = false) =>
    {
        if(!purse || !purse.activityPoints || !purse.activityPoints.size) return null;

        const types = Array.from(purse.activityPoints.keys()).filter(type => (displayedCurrencies.indexOf(type) >= 0));

        let count = 0;

        while(count < offset)
        {
            types.shift();

            count++;
        }

        count = 0;

        const elements: JSX.Element[] = [];

        for(const type of types)
        {
            if((limit > -1) && (count === limit)) break;

            if(seasonal) elements.push(
                <div className="currency-container">
                    <p style={{textAlign: "left", color: "var(--test-galaxytext)"}}>
                        <span className="badge bg-dark">{purse.activityPoints.get(type)}</span>
                        <span style={{float: "right"}}>
                            <img src={getUrlCurrency(type)}/>
                        </span>
                    </p>
                </div>
            );
            else elements.push(
                <div className="currency-container">
                <p style={{textAlign: "left", color: "var(--test-galaxytext)"}}>
                    <span className="badge bg-dark">{purse.activityPoints.get(type)}</span>
                    <span style={{float: "right"}}>
                        <img style={{}} src={getUrlCurrency(type)}/>
                    </span>
                </p>
                </div>
            );

            count++;
        }

        return elements;
    }, [ purse, displayedCurrencies, currencyDisplayNumberShort ]);

    if(!purse) return null;

    return (
        <Column alignItems="end" className="nitro-purse-container animate__animated animate__backInDown" gap={ 1 } style={{marginTop: "10px"}}>
            <img src="https://i.imgur.com/yPUsiUF.gif" style={{objectFit: "contain", height: "45px"}} className="text-center"/>
            <div className="currency-container">
                <p style={{textAlign: "left", color: "var(--test-galaxytext)"}}>
                    <span className="badge bg-dark">{purse.credits}</span>
                    <span style={{float: "right"}}>
                        <img src="https://lavvos.eu/swfs/images/wallet/-1.png"/>
                    </span>
                </p>
            </div>
            { getCurrencyElements(0, 2) }
            <div className="currency-container">
                <a target="_blank" href="https://lavvos.eu">
                    <p style={{textAlign: "left", color: "var(--test-galaxytext)"}}>
                    <small><span className="badge bg-dark">Tienda</span></small>
                        <span style={{float: "right"}}>
                            <img src="https://images.habbo.com/c_images/catalogue/icon_69.png" />
                        </span>
                    </p>
                </a>
            </div>
            <div>
                <button onClick={ event => CreateLinkEvent('help/show') } className="btn btn-sm currency-container-button" style={{width: "62px", display: "inline-block"}}><i className="icon icon-help" style={{marginTop: "5px"}}/></button> &nbsp;
                <button onClick={ event => CreateLinkEvent('user-settings/toggle') } className="btn btn-sm currency-container-button" style={{width: "62px", display: "inline-block"}}><i className="icon icon-cog" style={{marginTop: "5px", marginBottom: "2px"}}/></button>
            </div>
            
        </Column>
    );
}
