import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ILinkEventTracker } from '@nitrots/nitro-renderer';
import { FC, useEffect, useRef, useState } from 'react';
import { AddEventLinkTracker, CreateLinkEvent, RemoveLinkEventTracker } from '../../api';
import "./UpsideView.scss";
export const UpsideView: FC<{}> = props =>
{
    var isPlayed = false;
    var firstCheck = false;
    var radioUrl = "";

    const [ isVisible, setIsVisible ] = useState(true)
    const [ alerts, setAlerts ] = useState([]);
    const [ answer, setAnswer ] = useState("");
    const [ audio, setAudio ] = useState(new Audio(radioUrl))
    const myRef = useRef();
    const sso = new URLSearchParams(window.location.search).get('sso');

    useEffect(() =>
    {
        const linkTracker: ILinkEventTracker = {
            linkReceived: (url: string) =>
            {
                const parts = url.split('/');

                if(parts.length < 2) return;

                switch(parts[1])
                {
                    case 'o':
                        addNewAlert(parts[2], parts[3]);
                        return;
                }
            },
            eventUrlPrefix: 'mal/'
        };

        AddEventLinkTracker(linkTracker);

        return () => RemoveLinkEventTracker(linkTracker);
    }, [ setIsVisible ]);

    useEffect(() => {
        var intervalId = setInterval(radioChecker, 3000);

        async function radioChecker(){
            if(audio.paused) audio.play();
            new Promise(resolve => setTimeout(resolve, 1000));
            if(!audio.paused) clearInterval(intervalId);
        }
    }, []);

    function startRadio(){
        audio.src = radioUrl;
        var resp = audio.play();

        if (resp!== undefined) {
            resp.then(_ => {
                document.getElementById("startRadio").style.display = "none";
                document.getElementById("pauseRadio").style.display = "inline-block";
                isPlayed = true;
            }).catch(error => {});
        }
    }

    function pauseRadio(){
        document.getElementById("startRadio").style.display = "inline-block";
        document.getElementById("pauseRadio").style.display = "none";
        audio.pause();

        audio.src = "";
        isPlayed = false;
    }

    function volumeUp(){
        if(isPlayed)
            if(audio.volume != 1)
                audio.volume = audio.volume + 0.1;
    }

    function volumeDown(){
        if(isPlayed){
            if(audio.volume < 0.1)
                return;
            if(audio.volume != 0.1)
                audio.volume = audio.volume - 0.1;
        }
    }


    function getPlayersOnline(){
        fetch('https://lavvos.eu/api/get/online.php')
            .then((response) => response.text())
            .then((result) => 
            {
                document.getElementById("usersOnline").innerHTML = result;
            })
    }

    function getAlert(name, text, identifier){
        return(
            <div className="animate__animated animate__fadeInDown" style={{padding: "10px", backgroundColor: "var(--test-galaxy)", color: "var(--test-galaxytext)", borderRadius: "5px", width: "270px", marginBottom: "20px", wordBreak: "break-all"}}>
                <div style={{textAlign: "left", marginBottom: "10px"}}>
                    <span className="badge bg-danger">Nueva mención recibida</span>
                    <span style={{float: "right", cursor: "pointer"}}>
                        <span onClick={() => closeAlert(identifier)} className="badge bg-danger">x</span>
                    </span>
                </div>
                <div style={{marginBottom: "10px"}}>
                    <b>{name}:</b> &nbsp;
                    {text}
                </div>
                <input onChange={e => handleAnswer(e.target.value)} className="form-control" type="text" style={{marginBottom: "4px"}} />
                <button onClick={() => sendResponse(name, identifier)} className="btn btn-success btn-sm w-100">Responder</button>
            </div>
        )
    }

    var response = "";

    function handleAnswer(a){
        response = a;
    }

    function sendResponse(username, identifier){
        fetch("https://int.lavvos.eu/?type=mentionUser&userToMention=" + username + "&message=" + response + "&sso=" + sso);
        closeAlert(identifier);
    }

    function closeAlert(identifier){
        setAlerts(prev => (prev.filter(item => item.id !== identifier)));
    }
    

    async function addNewAlert(name, text){
        var identifier = Math.random();
        var alert = getAlert(name, text, identifier);
        setAlerts((oldArray => [...oldArray, {id: identifier, alert: alert}]));
        var audio = new Audio('https://lavvos.eu/swfs/sounds/plin.mp3');
        audio.play();
    }

    getPlayersOnline();
    setInterval(getPlayersOnline, 20000);
    audio.volume = 0.1;
    audio.autoplay = true;

    return (
        <>
            { isVisible &&
                <>
                <div className="nitro-left-side animate__animated animate__backInDown">
                    <button onClick={ event => CreateLinkEvent('help/show') } style={{backgroundColor: "var(--test-galaxytwo)", marginLeft: "7px"}} className="btn btn-sm rounded-pill border border-light nitro-left-side-button">
                        <img src="https://lavvos.eu/swfs/images/frank.gif" style={{marginTop: "2px", marginBottom: "2px"}} /> Ayuda
                    </button>
                    <button style={{backgroundColor: "var(--test-galaxytwo)", marginLeft: "7px"}} className="btn btn-sm rounded-pill border border-light nitro-left-side-button">
                        <img style={{transform: "scale(0.9)"}} src="https://lavvos.eu/swfs/images/ons.png"/><b id="usersOnline">0</b> &nbsp;
                    </button>
                    <button style={{backgroundColor: "var(--test-galaxytwo)", marginLeft: "7px"}} className="btn btn-sm rounded-pill border border-light nitro-left-side-button">
                        <div style={{padding: "4px"}}>
                            <FontAwesomeIcon id="startRadio" style={{display: "none", fontSize: "17px"}} onClick={e => startRadio()} icon="play"></FontAwesomeIcon>
                            <FontAwesomeIcon id="pauseRadio" style={{fontSize: "17px"}} onClick={e => pauseRadio()} icon="pause"></FontAwesomeIcon>
                            &nbsp;&nbsp;
                            <FontAwesomeIcon style={{fontSize: "17px"}} onClick={e => volumeUp()} icon="plus"></FontAwesomeIcon> &nbsp;
                            <FontAwesomeIcon style={{fontSize: "17px"}} onClick={e => volumeDown()} icon="minus"></FontAwesomeIcon>
                        </div>
                    </button>

                    <div id="mentionAlerts" style={{marginTop: "20px"}}>
                        { alerts != null &&
                            <>
                                { alerts.map((alert) => 
                                    <>{alert.alert}</>
                                )}
                            </>
                        }
                    </div>
                </div>
                </>
            }
        </>
    );
}
