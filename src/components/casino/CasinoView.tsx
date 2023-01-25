import { ILinkEventTracker } from '@nitrots/nitro-renderer';
import { FC, useEffect, useState } from 'react';
import { AddEventLinkTracker, RemoveLinkEventTracker } from '../../api';
import { NitroCardContentView, NitroCardHeaderView, NitroCardView } from '../../common';
export const CasinoView: FC<{}> = props =>
{
    const sso = new URLSearchParams(window.location.search).get('sso');
    const [ isVisible, setIsVisible ] = useState(false)
    const [ dice, setDice ] = useState("none");
    const [ rouletteFloor, setRouletteFloor ] = useState("none");
    const [ rouletteWall, setRouletteWall ] = useState("none");
    const [ vendingMachine, setVendingMachine] = useState("none");

    // Dados
    const [ diceNumber, setDiceNumber ] = useState("1");
    const [ diceCoin, setDiceCoin ] = useState("1");
    const [ diceBet, setDiceBet ] = useState("1");

    // RuletaSuelo
    const [ ruletaSueloNumber, setRuletaSueloNumber ] = useState("1");
    const [ ruletaSueloCoin, setRuletaSueloCoin ] = useState("1");
    const [ ruletaSueloBet, setRuletaSueloBet ] = useState("1");

    // RuletaPared
    const [ ruletaParedCoin, setRuletaParedCoin ] = useState("1");
    const [ ruletaParedBet, setRuletaParedBet ] = useState("1");

    function betDados(){
        fetch("https://int.lavvos.eu/?type=betDadosCasino&quantity=" + diceBet + "&coin=" + diceCoin + "&number=" + diceNumber + "&sso="+sso);

        setIsVisible(false);
    }

    function betRuletaSuelo(){
        fetch("https://int.lavvos.eu/?type=betRuletaSuelo&quantity=" + ruletaSueloBet + "&coin=" + ruletaSueloCoin + "&number=" + ruletaSueloNumber + "&sso="+sso);

        setIsVisible(false);
    }

    function betRuletaPared(){
        fetch("https://int.lavvos.eu/?type=betRuletaPared&quantity=" + ruletaParedBet + "&coin=" + ruletaParedCoin + "&sso="+sso);

        setIsVisible(false);
    }
    
    useEffect(() =>
    {
        const linkTracker: ILinkEventTracker = {
            linkReceived: (url: string) =>
            {
                const parts = url.split('/');

                if(parts.length < 2) return;

                switch(parts[1])
                {
                    case 'rouletteColor':
                        setRouletteWall("block");
                        setVendingMachine("none");
                        setDice("none");
                        setRouletteFloor("none");
                        setIsVisible(true);
                        return;
                    case 'rouletteFloor':
                        setRouletteWall("none");
                        setVendingMachine("none");
                        setDice("none");
                        setRouletteFloor("block");
                        setIsVisible(true);
                        return;
                    case 'dice':
                        setRouletteWall("none");
                        setVendingMachine("none");
                        setDice("block");
                        setRouletteFloor("none");
                        setIsVisible(true);
                        return;
                    case 'vendingMachine':
                        setRouletteWall("none");
                        setVendingMachine("block");
                        setDice("none");
                        setRouletteFloor("none");
                        setIsVisible(true);
                        return;
                    case 'hide':
                        setIsVisible(false);
                        return;
                }
            },
            eventUrlPrefix: 'casino/'
        };

        AddEventLinkTracker(linkTracker);

        return () => RemoveLinkEventTracker(linkTracker);
    }, [ setIsVisible ]);

    return (
        <>
            { isVisible &&
                <NitroCardView style={{width: "350px"}}>
                <NitroCardHeaderView headerText="Apostar"  onCloseClick={ event => setIsVisible(false) }/>
                <NitroCardContentView>
                <div id="diceView" style={{display: dice}}>
                    <div className="alert alert-primary text-center"><b>Selecciona un número del 1 al 6. Si el dado saca el mismo número, ganas x2.</b></div>
                    <b style={{color: "var(--test-galaxytext)"}}>Selecciona un número entre 1 y 6</b>
                    <input onChange={e => setDiceNumber(e.target.value)} className="form-control" type="number" placeholder="0" />
                    <b style={{color: "var(--test-galaxytext)"}}>Moneda a apostar:</b>
                    <select value={diceCoin} onChange={e => setDiceCoin(e.target.value)} className="form-control">
                        <option value="1">Créditos</option>
                        <option value="3">Cometas</option>
                        <option value="2">Asteroides</option>
                    </select>
                    <b style={{color: "var(--test-galaxytext)"}}>Cantidad a apostar:</b>
                    <input onChange={e => setDiceBet(e.target.value)} className="form-control" type="number" placeholder="0" />
                    <br/>
                    <button onClick={() => betDados()} className="btn btn-success w-100">Apostar</button>
                </div>
                <div id="rouletteColorsView" style={{display: rouletteWall}}>
                    <div className="alert alert-primary text-center"><b>Depende del color, ganas o pierdes.<br/>Verde: x5<br/>Morado: x2</b></div>
                    <b style={{color: "var(--test-galaxytext)"}}>Moneda a apostar:</b>
                    <select value={ruletaParedCoin} onChange={e => setRuletaParedCoin(e.target.value)} className="form-control">
                        <option value="1">Créditos</option>
                        <option value="3">Cometas</option>
                        <option value="2">Asteroides</option>
                    </select>
                    <b style={{color: "var(--test-galaxytext)"}}>Cantidad a apostar:</b>
                    <input onChange={e => setRuletaParedBet(e.target.value)} className="form-control" type="number" placeholder="0" />
                    <br/>
                    <button onClick={() => betRuletaPared()} className="btn btn-success w-100">Apostar</button>
                </div>
                <div id="rouletteFloorView" style={{display: rouletteFloor}}>
                    <div className="alert alert-primary text-center"><b>Selecciona un número. Si el número es par y toca par, ganarás un x1.5. Si toca el mismo número, ganarás un x5. Si seleccionas 0 y sale 0 ganarás un x10.</b></div>
                    <b style={{color: "var(--test-galaxytext)"}}>Selecciona un número entre 0 y 32</b>
                    <input onChange={e => setRuletaSueloNumber(e.target.value)} className="form-control" type="number" placeholder="0" />
                    <b style={{color: "var(--test-galaxytext)"}}>Moneda a apostar:</b>
                    <select value={ruletaSueloCoin} onChange={e => setRuletaSueloCoin(e.target.value)} className="form-control">
                        <option value="1">Créditos</option>
                        <option value="3">Cometas</option>
                        <option value="2">Asteroides</option>
                    </select>
                    <b style={{color: "var(--test-galaxytext)"}}>Cantidad a apostar:</b>
                    <input onChange={e => setRuletaSueloBet(e.target.value)}  className="form-control" type="number" placeholder="0" />
                    <br/>
                    <button onClick={() => betRuletaSuelo()} className="btn btn-success w-100">Apostar</button>
                </div>
                <div id="vendingMachineView" style={{display: vendingMachine}}>
                    <div className="alert alert-primary text-center"><b>Si la tragaperras te da premio, ganas x2.</b></div>
                    <b style={{color: "var(--test-galaxytext)"}}>Moneda a apostar:</b>
                    <select className="form-control">
                        <option>Créditos</option>
                        <option>Cometas</option>
                        <option>Asteroides</option>
                    </select>
                    <b style={{color: "var(--test-galaxytext)"}}>Cantidad a apostar:</b>
                    <input className="form-control" type="number" placeholder="0" />
                    <br/>
                    <button className="btn btn-success w-100">Apostar</button>
                </div>
                </NitroCardContentView>
            </NitroCardView>
            }
        </>
    );
}
