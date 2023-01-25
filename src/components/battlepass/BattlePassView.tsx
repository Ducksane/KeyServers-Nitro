import { ILinkEventTracker } from '@nitrots/nitro-renderer';
import { FC, useEffect, useState } from 'react';
import { AddEventLinkTracker, RemoveLinkEventTracker } from '../../api';
import { NitroCardContentView, NitroCardHeaderView, NitroCardView } from '../../common';

export const BattlePassView: FC<{}> = props =>
{
    const sso = new URLSearchParams(window.location.search).get('sso');
    const [ isVisible, setIsVisible ] = useState(false);
    const [ battlePass, setBattlePass ] = useState(null);
    const [ actualTab, setActualTab ] = useState("battlePassMainView");

    function buyBattlePass(){
        fetch("https://int.lavvos.eu/?type=buyGalaxyPass&sso=" + sso);
        setIsVisible(false);
    }

    function changeTab(tab){
        document.getElementById(actualTab).style.display = "none";
        document.getElementById(tab).style.display = "block";
        setActualTab(tab);
    }

    function getHabboImaging(look){
        return "https://habbo-imaging.lavvos.eu/?figure=" + look + "&gesture=sml&direction=2&effect=3&size=l&img_format=gif";
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
                    case 'open':
                        setActualTab("battlePassMainView")
                        fetch("https://int.lavvos.eu/?type=getInfoOpenGalaxyPassEmu&sso=" + sso)
                        .then(response => response.json())
                        .then((response) => { 
                            setBattlePass(response);
                            setIsVisible(true);
                        })
                        return;
                    case 'update':
                        fetch("https://int.lavvos.eu/?type=getInfoOpenGalaxyPassEmu&sso=" + sso)
                        .then(response => response.json())
                        .then((response) => { 
                            setBattlePass(response);
                        })
                        return;
                    case 'hide':
                        setIsVisible(false);
                        return;
                }
            },
            eventUrlPrefix: 'battlepass/'
        };

        AddEventLinkTracker(linkTracker);

        return () => RemoveLinkEventTracker(linkTracker);
    }, [ setIsVisible ]);

    return (
        <>
            { isVisible &&
                <NitroCardView>
                <NitroCardHeaderView headerText="Lavvos Pass"  onCloseClick={ event => setIsVisible(false) }/>
                <NitroCardContentView>
                    { battlePass == null ? (
                        <div style={{width: "600px", height: "400px", fontSize: "16px"}} className="alert alert-primary text-center">Cargando, espera por favor</div>
                    ) : (
                        <>
                            <div id="battlePassMainView" style={{width: "600px"}}>
                                <div className="row g-1">
                                    <div className="col-md-4">
                                        <div style={{padding: "20px", backgroundImage: "url(https://files.habboemotion.com/resources/images/homebgs/bg_rain.gif)", textAlign: "center", borderRadius: "3px"}}>
                                            <img style={{position: "relative", bottom: "30px"}} src={getHabboImaging(battlePass.look)} className="img-fluid" />
                                            
                                            <div style={{position: "relative", bottom: "10px"}}>
                                                <h3><b>{battlePass.name}</b></h3>
                                                <span className='badge bg-primary' style={{fontSize: "15px", marginBottom: "3px"}}>Nivel: {battlePass.level}</span><br/>
                                                <span className='badge bg-info' style={{fontSize: "13px", marginBottom: "3px"}}>Experiencia: {battlePass.exp}</span>
                                                { !battlePass.isActive ? <button onClick={() => buyBattlePass()} className="btn btn-success btn-sm">Comprar (150 créditos)</button> : <><br/><br/><br/></> }
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-8">
                                        <div style={{backgroundImage: "url(https://cdn.discordapp.com/attachments/929069063114752053/1005492439953440910/pantalla1.gif)", width: "100%", height: "186px", marginBottom: "8px", borderRadius: "3px"}}>
                                            <div style={{margin: 0, position: "absolute", top: "32%", msTransform: "translateY(-50%)", transform: "translateY(-50%)", right: "24%"}}>
                                                <button onClick={() => changeTab("battlePassMissionsView")} className="btn btn-dark btn-lg">Ver misiones</button>
                                            </div>
                                        </div>
                                        <div style={{backgroundImage: "url(https://cdn.discordapp.com/attachments/929069063114752053/1005492439953440910/pantalla1.gif)", width: "100%", height: "185px", borderRadius: "3px"}}>
                                            <div style={{margin: 0, position: "absolute", top: "78%", msTransform: "translateY(-50%)", transform: "translateY(-50%)", right: "22%"}}>
                                                <button onClick={() => changeTab("battlePassRewardsView")} className="btn btn-primary btn-lg">Ver recompensas</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div id="battlePassMissionsView" style={{display: "none", width: "900px"}}>
                                <div className="row">
                                    {battlePass.missionStats.map((mission) => 
                                        <div className="col-md-6">
                                            <div className='alert bg-dark text-white'>
                                                <div style={{textAlign: "left"}}>
                                                    <span className="badge bg-info" style={{fontSize: "15px"}}><img src="https://4.bp.blogspot.com/-kNQ9Y7U9aq0/WV-zzHKsrLI/AAAAAAAA6uo/_C21AzCd9uQ9utBtdT5pUMsQlBiu9SAKwCKgBGAs/s1600/ed483ed9b79b282bd901da62daee7669.gif" /> Nivel {mission.id}</span> &nbsp;
                                                    {mission.missionName} 
                                                    <span style={{float: "right", marginTop: "5px"}}>
                                                        {mission.expDone == mission.expMax ? <span className='badge bg-success'>{mission.expDone}/{mission.expMax}</span> : <span className='badge bg-danger'>{mission.expDone}/{mission.expMax}</span>}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="col-md-12">
                                    <button onClick={() => changeTab("battlePassMainView")} className="btn w-100 btn-success">Volver</button>
                                </div>
                            </div>
                            <div id="battlePassRewardsView" style={{display: "none", width: "500px"}}>
                                <div className="row g-0">
                                    {battlePass.missionStats.map((mission) => 
                                        <div className="col-md-3" style={{marginBottom: "6px"}}>
                                            <div style={{textAlign: "center", padding: "10px", backgroundImage: "url(https://files.habboemotion.com/resources/images/homebgs/bg_serpentine_darkblue.gif)", borderRadius: "3px", marginRight: "6px"}}>
                                                <img src={mission.imageReward} />
                                                <span className="badge bg-primary" style={{fontSize: "14px"}}>Nivel {mission.id}</span><br/>
                                                {mission.expDone == mission.expMax ? <span className='badge bg-success'>Conseguido</span> : <span className='badge bg-danger'>Por conseguir</span>}
                                            </div>
                                        </div>
                                    )}

                                    <div className="col-md-3" style={{marginBottom: "6px"}}>
                                        <div style={{textAlign: "center", padding: "10px", backgroundImage: "url(https://files.habboemotion.com/resources/images/homebgs/bg_serpntine_darkred.gif)", borderRadius: "3px", marginRight: "6px"}}>
                                            <img src="https://cdn.discordapp.com/attachments/882679902162288651/1007401963345936395/final-1.png" />
                                            <span className="badge bg-info" style={{fontSize: "14px"}}>Final</span><br/>
                                            <span className='badge bg-danger'>Por conseguir</span>
                                        </div>
                                    </div>
                                    <div className="col-md-3" style={{marginBottom: "6px"}}>
                                        <div style={{textAlign: "center", padding: "10px", backgroundImage: "url(https://files.habboemotion.com/resources/images/homebgs/bg_serpntine_darkred.gif)", borderRadius: "3px", marginRight: "6px"}}>
                                            <img src="https://cdn.discordapp.com/attachments/882679902162288651/1007401963849261106/final-2.png" />
                                            <span className="badge bg-info" style={{fontSize: "14px"}}>Final</span><br/>
                                            <span className='badge bg-danger'>Por conseguir</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <button onClick={() => changeTab("battlePassMainView")} className="btn w-100 btn-success">Volver</button>
                                </div>
                            </div>
                        </>
                    )}
                </NitroCardContentView>
            </NitroCardView>
            }
        </>
    );
}
