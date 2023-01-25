import { ILinkEventTracker } from '@nitrots/nitro-renderer';
import { FC, useEffect, useState } from 'react';
import { AddEventLinkTracker, RemoveLinkEventTracker } from '../../api';
import { NitroCardContentView, NitroCardHeaderView, NitroCardView } from '../../common';

export const GalertsView: FC<{}> = props =>
{
    const [ isVisible, setIsVisible ] = useState(false)
    const [ username, setUsername ] = useState("");
    const [ figure, setFigure ] = useState("")
    const [ message, setMessage] = useState("")
    const [ headerText, setHeaderText ] = useState("Notificación")
    const [ roomId, setRoomId ] = useState("0")
    const [ actualTab, setActualTab ] = useState("gameAlert")
    const [background, setBackground] = useState("url(https://files.habboemotion.com/resources/images/homebgs/nl_green_bg.gif)")
    const [color, setColor] = useState("primary")
    const [alertText, setAlertText] = useState("undefined")
    const sso = new URLSearchParams(window.location.search).get('sso');

    function getHabboImaging(look){
        return "https://habbo-imaging.lavvos.eu/?figure=" + look + "&gesture=sml&direction=2&effect=6&img_format=gif";
    }

    function goToRoom(){
        fetch("https://int.lavvos.eu/?type=goToRoom&roomId=" + roomId + "&sso=" + sso)
        setIsVisible(false)
    }

    function getBadge() { return "badge bg-" + color; }
    function getAlert() { return "alert alert-" + color + " text-center"; }

    useEffect(() =>
    {
        const linkTracker: ILinkEventTracker = {
            linkReceived: (url: string) =>
            {
                const parts = url.split('/');

                if(parts.length < 2) return;

                switch(parts[1])
                {
                    case '@gm':
                        setIsVisible(false)
                        setHeaderText("Nuevo juego abierto")
                        setRoomId(parts[2])
                        setUsername(parts[3]);
                        setMessage(parts[4]);
                        setAlertText("📢 <b>Nuevo juego abierto.</b> ¡Únete si quieres ganar premios!");
                        setColor("warning");
                        setBackground("url(https://files.habboemotion.com/resources/images/homebgs/nl_green_bg.gif)");

                        fetch("https://int.lavvos.eu/?type=getFigure&getFigure=" + parts[3])
                        .then(response => response.text())
                        .then((response) => { 
                            setFigure(response);
                            setIsVisible(true);
                            var audio = new Audio('https://lavvos.eu/swfs/sounds/ding.mp3');
                            audio.play();
                        })
                        return;

                    case '@ev':
                        setIsVisible(false)
                        setHeaderText("Nuevo evento abierto")
                        setRoomId(parts[2])
                        setUsername(parts[3]);
                        setMessage(parts[4]);
                        setAlertText("📢 <b>Nuevo evento abierto.</b> ¡Únete si quieres ganar premios!");
                        setColor("info");
                        setBackground("url(https://files.habboemotion.com/resources/images/homebgs/bg_pattern_bobbaskulls1.gif)");

                        fetch("https://int.lavvos.eu/?type=getFigure&getFigure=" + parts[3])
                        .then(response => response.text())
                        .then((response) => { 
                            setFigure(response);
                            setIsVisible(true);
                            var audio = new Audio('https://lavvos.eu/swfs/sounds/ding.mp3');
                            audio.play();
                        })
                        return;
                        
                    case '@pbl':
                        setIsVisible(false)
                        setHeaderText("Nueva oleada de publicidad abierta")
                        setRoomId(parts[2])
                        setUsername(parts[3]);
                        setMessage(parts[4]);
                        setAlertText("📢 <b>Nueva oleada de publicidad abierta.</b> ¡Únete si quieres ganar premios!");
                        setColor("danger");
                        setBackground("url(https://files.habboemotion.com/resources/images/homebgs/xmas_bgpattern_starsky.gif)");

                        fetch("https://int.lavvos.eu/?type=getFigure&getFigure=" + parts[3])
                        .then(response => response.text())
                        .then((response) => { 
                            setFigure(response);
                            setIsVisible(true);
                            var audio = new Audio('https://lavvos.eu/swfs/sounds/ding.mp3');
                            audio.play();
                        })
                        return;
                        
                    case 'hide':
                        setIsVisible(false);
                        return;
                }
            },
            eventUrlPrefix: 'galert/'
        };

        AddEventLinkTracker(linkTracker);

        return () => RemoveLinkEventTracker(linkTracker);
    }, [ setIsVisible ]);

    return (
        <>
            { isVisible &&
                <NitroCardView style={{width: "350px"}} className="animate__animated animate__flipInX">
                <NitroCardHeaderView headerText={headerText}  onCloseClick={ event => setIsVisible(false) }/>
                <NitroCardContentView>
                   <div>
                        <div className="card" style={{backgroundImage: background}}>
                            <div className={getAlert()} dangerouslySetInnerHTML={{__html: alertText}}>
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-md-12 text-center">
                                        <img src={getHabboImaging(figure)} /><br/>
                                        <span className="badge bg-primary" style={{fontSize: "12px"}}>Juego abierto por {username}</span><br/>
                                        <span className={getBadge()} style={{fontSize: "18px"}}>{message}</span><br/>
                                        <button onClick={() => goToRoom()} className="btn btn-success btn-sm rounded w-100">Ir a sala</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                   </div>
                </NitroCardContentView>
            </NitroCardView>
            }
        </>
    );
}
