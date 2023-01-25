import { ILinkEventTracker } from '@nitrots/nitro-renderer';
import { FC, useEffect, useState } from 'react';
import { AddEventLinkTracker, RemoveLinkEventTracker } from '../../api';
import { NitroCardContentView, NitroCardHeaderView, NitroCardView } from '../../common';

export const BawToolView: FC<{}> = props =>
{
    const sso = new URLSearchParams(window.location.search).get('sso');
    const [ isVisible, setIsVisible ] = useState(false)
    const [ altura, setAltura ] = useState("0")
    const [ estado, setEstado ] = useState("0")
    const [ rotacion, setRotacion ] = useState("0")

    function maxFloor(){
        fetch("https://int.lavvos.eu/?type=maxFloor&sso="+sso);
    }

    function autoFloor(){
        fetch("https://int.lavvos.eu/?type=autoFloor&sso="+sso);
    }

    function reloadRoom(){
        fetch("https://int.lavvos.eu/?type=reloadRoom&sso="+sso);
    }

    function changeAltura(){
        fetch("https://int.lavvos.eu/?type=cambiarAltura&altura="+altura+"&sso="+sso);
    }

    function resetAltura(){
        fetch("https://int.lavvos.eu/?type=cambiarAltura&altura=999&sso="+sso);
    }

    function cambiarEstado(){
        fetch("https://int.lavvos.eu/?type=cambiarEstado&estado="+estado+"&sso="+sso);
    }

    function cambiarRotacion(){
        fetch("https://int.lavvos.eu/?type=cambiarRotacion&rotacion="+rotacion+"&sso="+sso);
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
                    case 'show':
                        setIsVisible(true);
                        return;
                    case 'hide':
                        setIsVisible(false);
                        return;
                }
            },
            eventUrlPrefix: 'bawtool/'
        };

        AddEventLinkTracker(linkTracker);

        return () => RemoveLinkEventTracker(linkTracker);
    }, [ setIsVisible ]);

    return (
        <>
            { isVisible &&
                <NitroCardView style={{width: "250px"}}>
                <NitroCardHeaderView headerText="Herramienta builder"  onCloseClick={ event => setIsVisible(false) }/>
                <NitroCardContentView>
                    <button className="btn w-100" onClick={() => maxFloor()} style={{backgroundColor: "var(--test-galaxytwo)"}}>Maxfloor</button>
                    <button className="btn w-100" onClick={() => autoFloor()} style={{backgroundColor: "var(--test-galaxytwo)"}}>Autofloor</button>
                    <button className="btn w-100" onClick={() => reloadRoom()} style={{backgroundColor: "var(--test-galaxytwo)"}}>Reload</button>
                    <div className="row" style={{marginTop: "10px"}}>
                        <div className="col-md-4">
                            <input type="number" onChange={e => setAltura(e.target.value)} placeholder="0" className="form-control" />
                        </div>
                        <div className="col-md-8">
                            <button className="btn w-100" onClick={() => changeAltura()} style={{backgroundColor: "var(--test-galaxytwo)"}}>Cambiar altura</button>
                        </div>
                    </div>
                    <button className="btn btn-sm w-100" onClick={() => resetAltura()} style={{backgroundColor: "var(--test-galaxytwo)"}}>Restablecer altura</button>
                    <div className="row" style={{marginTop: "10px"}}>
                        <div className="col-md-4">
                            <input type="number" onChange={e => setRotacion(e.target.value)} placeholder="0" className="form-control" />
                        </div>
                        <div className="col-md-8">
                            <button className="btn w-100" onClick={() => cambiarRotacion()} style={{backgroundColor: "var(--test-galaxytwo)"}}>Cambiar rotación</button>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-4">
                            <input type="number" onChange={e => setEstado(e.target.value)} placeholder="0" className="form-control" />
                        </div>
                        <div className="col-md-8">
                            <button className="btn w-100" onClick={() => cambiarEstado()} style={{backgroundColor: "var(--test-galaxytwo)"}}>Cambiar estado</button>
                        </div>
                    </div>
                </NitroCardContentView>
            </NitroCardView>
            }
        </>
    );
}
