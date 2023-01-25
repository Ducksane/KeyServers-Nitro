import { RoomSessionEvent } from '@nitrots/nitro-renderer';
import { FC, useCallback, useEffect, useState } from 'react';
import { GetConfiguration, GetConfigurationManager } from '../../api';
import { UseRoomSessionManagerEvent, useSessionInfo } from '../../hooks';

const widgetSlotCount = 7;

export const HotelView: FC<{}> = props =>
{
    const [ isVisible, setIsVisible ] = useState(true);
    const { userFigure = null } = useSessionInfo();

    const [topDiamonds, setTopDiamonds] = useState([]);
    const [topDuckets, setTopDuckets] = useState([]);
    const [viewPoints, setViewPoints] = useState("");
    const sso = new URLSearchParams(window.location.search).get('sso');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("https://int.lavvos.eu/?type=getHotelViewStats&sso=" + sso)
        .then(response => response.json())
        .then((response) => { 
            setViewPoints(response.viewPoints);
            setTopDiamonds(response.diamonds);
            setTopDuckets(response.duckets);
            setLoading(false);
        })
    }, [])

    function getWidthProgressBar() { return viewPoints + "%"; }

    function getImagerByFigure(figure) { return "url(https://habbo-imaging.lavvos.eu/?figure=" + figure + "&amp;direction=2&amp;head_direction=2)"; } 

    function getProfileUrl(username) { return "https://lavvos.eu/profile/" + username; }

    const onRoomSessionEvent = useCallback((event: RoomSessionEvent) =>
    {
        switch(event.type)
        {
            case RoomSessionEvent.CREATED:
                setIsVisible(false);
                return;
            case RoomSessionEvent.ENDED:
                setIsVisible(event.openLandingView);
                return;
        }
    }, []);

    UseRoomSessionManagerEvent(RoomSessionEvent.CREATED, onRoomSessionEvent);
    UseRoomSessionManagerEvent(RoomSessionEvent.ENDED, onRoomSessionEvent);

    if(!isVisible) return null;

    const backgroundColor = GetConfiguration('hotelview')['images']['background.colour'];
    const background = GetConfigurationManager().interpolate(GetConfiguration('hotelview')['images']['background']);
    const sun = GetConfigurationManager().interpolate(GetConfiguration('hotelview')['images']['sun']);
    const drape = GetConfigurationManager().interpolate(GetConfiguration('hotelview')['images']['drape']);
    const left = GetConfigurationManager().interpolate(GetConfiguration('hotelview')['images']['left']);
    const rightRepeat = GetConfigurationManager().interpolate(GetConfiguration('hotelview')['images']['right.repeat']);
    const right = GetConfigurationManager().interpolate(GetConfiguration('hotelview')['images']['right']);

    return (
        <div className="nitro-hotel-view">
            <div className="container h-100 py-3 overflow-hidden landing-widgets">
                <div className="row h-100" style={{marginLeft: "100px", marginTop: "50px"}}>
                    { !loading && 
                        <div className="col-md-10 animate__animated animate__fadeInDown">
                            <div className="card" style={{backgroundColor: "var(--test-galaxy)", padding: "20px", borderRadius: "5px", marginBottom: "15px"}}>
                                <div className="row">
                                    <div className="col-md-10">
                                        <h4 style={{color: "var(--test-galaxytext)"}}><b>Recompensa mensual</b></h4><br/>
                                        <div style={{height: "30px"}} className="progress">
                                            <div className="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style={{width: getWidthProgressBar()}}>
                                                {viewPoints}%
                                            </div>
                                        </div>
                                        <small style={{color: "var(--test-galaxytext)"}}>Debes llegar a 100 horas jugadas para obtener la recompensa <b>({viewPoints}/100)</b> - Termina el 30 de septiembre</small>
                                    </div>
                                    <div className="col-md-2 text-center">
                                        <img style={{marginTop: "17px"}} src="https://i.imgur.com/RJNXe26.png" />
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="card" style={{backgroundColor: "var(--test-galaxy)", padding: "20px", borderRadius: "5px", marginBottom: "15px"}}>
                                        <h4 style={{color: "var(--test-galaxytext)"}}><b>Top cometas</b></h4><br/>
                                        {topDiamonds.map((top) => 
                                            <div className="row" style={{backgroundColor: "var(--test-galaxytwo)", padding: "7px", borderRadius: "5px", marginBottom: "5px"}}>
                                                <div className="col-md-2">
                                                    <div style={{paddingBottom: "-15px"}}>
                                                        <div className="user-img" style={{backgroundImage: getImagerByFigure(top.figure), backgroundPosition: "-11px -14px", width: "45px", height: "48px", marginLeft: "5px"}}></div>
                                                    </div>
                                                </div>
                                                <div className="col-md-10">
                                                    <br/>
                                                    <div style={{float: "right"}}>
                                                        <b>
                                                            <span style={{fontSize: "14px"}} className="badge bg-dark"> 
                                                                <a className="text-white" href={getProfileUrl(top.username)} target="_blank">{top.username}</a>
                                                            </span>
                                                        </b> &nbsp;
                                                        <b><span style={{fontSize: "14px"}} className="badge bg-primary">{top.vip_points} cometas</span></b>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="card" style={{backgroundColor: "var(--test-galaxy)", padding: "20px", borderRadius: "5px", marginBottom: "15px"}}>
                                        <h4 style={{color: "var(--test-galaxytext)"}}><b>Top asteroides</b></h4><br/>
                                        {topDuckets.map((top) => 
                                            <div className="row" style={{backgroundColor: "var(--test-galaxytwo)", padding: "7px", borderRadius: "5px", marginBottom: "5px"}}>
                                                <div className="col-md-2">
                                                    <div style={{paddingBottom: "-15px"}}>
                                                        <div className="user-img" style={{backgroundImage: getImagerByFigure(top.figure), backgroundPosition: "-11px -14px", width: "45px", height: "48px", marginLeft: "5px"}}></div>
                                                    </div>
                                                </div>
                                                <div className="col-md-10">
                                                    <br/>
                                                    <div style={{float: "right"}}>
                                                        <b>
                                                            <span style={{fontSize: "14px"}} className="badge bg-dark"> 
                                                                <a className="text-white" href={getProfileUrl(top.username)} target="_blank">{top.username}</a>
                                                            </span>
                                                        </b> &nbsp;
                                                        <b><span style={{fontSize: "14px"}} className="badge bg-info">{top.activity_points} asteroides</span></b>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    }
                </div>
            </div>
            <div className="background position-absolute" style={ (background && background.length) ? { backgroundImage: `url(${ background })` } : {} } />
            <div className="sun position-absolute" style={ (sun && sun.length) ? { backgroundImage: `url(${ sun })` } : {} } />
            <div className="drape position-absolute" style={ (drape && drape.length) ? { backgroundImage: `url(https://lavvos.eu/swfs/banners/logohotel.png)` } : {} } />
            <div className="left position-absolute" style={ (left && left.length) ? { backgroundImage: `url(${ left })` } : {} } />
            <div className="right-repeat position-absolute" style={ (rightRepeat && rightRepeat.length) ? { backgroundImage: `url(${ rightRepeat })` } : {} } />
            <div className="right position-absolute" style={ (right && right.length) ? { backgroundImage: `url(https://lavvos.eu/swfs/banners/testt.png)` } : {} } />
            
        </div>
    );
}
