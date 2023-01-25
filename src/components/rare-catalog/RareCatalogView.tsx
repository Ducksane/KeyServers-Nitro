import { ILinkEventTracker } from '@nitrots/nitro-renderer';
import { FC, useEffect, useState } from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import { AddEventLinkTracker, RemoveLinkEventTracker } from '../../api';
import { NitroCardContentView, NitroCardHeaderView, NitroCardView } from '../../common';

export const RareCatalogView : FC<{}> = props =>
{
    const sso = new URLSearchParams(window.location.search).get('sso');
    const [ isVisible, setIsVisible ] = useState(false)
    const [ lastRares, setLastRares ] = useState(null)
    const [ custom, setCustom ] = useState(null);
    const [ rares, setRares ] = useState(null);
    const [ megas, setMegas ] = useState(null);
    const [ ultras, setUltras ] = useState(null);
    const [busqueda, setBusqueda] = useState(null);
    const [busquedaString, setBusquedaString] = useState("");

    function searchItem(){
        fetch("https://lavvos.eu/system/controllers/eha.php?getItemsByName=" + busquedaString)
        .then(response => response.json())
        .then((response) => { 
            setBusqueda(response);
        })
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
                        fetch("https://lavvos.eu/system/controllers/eha.php?getLastItems=true")
                        .then(response => response.json())
                        .then((response) => { 
                            setLastRares(response);
                        })

                        fetch("https://lavvos.eu/system/controllers/eha.php?getLastItemsCategory=1")
                        .then(response => response.json())
                        .then((response) => { 
                            setCustom(response);
                        })

                        fetch("https://lavvos.eu/system/controllers/eha.php?getLastItemsCategory=2")
                        .then(response => response.json())
                        .then((response) => { 
                            setRares(response);
                        })

                        fetch("https://lavvos.eu/system/controllers/eha.php?getLastItemsCategory=3")
                        .then(response => response.json())
                        .then((response) => { 
                            setMegas(response);
                        })

                        fetch("https://lavvos.eu/system/controllers/eha.php?getLastItemsCategory=4")
                        .then(response => response.json())
                        .then((response) => { 
                            setUltras(response);
                        })


                        setIsVisible(true);
                        return;
                    case 'hide':
                        setIsVisible(false);
                        return;
                }
            },
            eventUrlPrefix: 'ratecatalog/'
        };

        AddEventLinkTracker(linkTracker);

        return () => RemoveLinkEventTracker(linkTracker);
    }, [ setIsVisible ]);

    return (
        <>
            { isVisible &&
                <NitroCardView style={{width: "750px", height: "550px"}}>
                <NitroCardHeaderView headerText="Catálogo de rares"  onCloseClick={ event => setIsVisible(false) }/>
                <NitroCardContentView className="text-dark">
                    <Tabs defaultActiveKey="home" id="uncontrolled-tab-example" className="mb-3">
                        <Tab eventKey="home" title="Últimos rares" style={{color: "var(--test-galaxytext)"}}>
                            { lastRares != null &&
                                <div className="row">
                                { lastRares.map((rare) => 
                                    <div className="col-md-3">
                                        <div className="text-center" style={{backgroundImage: "url(https://files.habboemotion.com/resources/images/homebgs/bg_colour_07.gif)", padding: "10px", borderRadius: "3px", marginBottom: "10px"}}>
                                            <img src={rare.image} style={{height: "120px", objectFit: "contain"}} />
                                            <h5 style={{color: "#000"}}>{rare.name}</h5>
                                            <span className="badge bg-dark"><img src="https://lavvos.eu/swfs/monedas/0.png" /> {rare.price_diamonds}</span><br/>
                                            <span className="badge bg-primary"><img src="https://lavvos.eu/swfs/monedas/5.png" /> {rare.price_th}</span>
                                        </div>
                                    </div>
                                )}
                                </div>
                            }
                        </Tab>
                        <Tab eventKey="custom" title="Custom" style={{color: "var(--test-galaxytext)"}}>
                            { custom != null &&
                                <div className="row">
                                { custom.map((rare) => 
                                    <div className="col-md-3">
                                        <div className="text-center" style={{backgroundImage: "url(https://files.habboemotion.com/resources/images/homebgs/bg_colour_07.gif)", padding: "10px", borderRadius: "3px", marginBottom: "10px"}}>
                                            <img src={rare.image} style={{height: "120px", objectFit: "contain"}} />
                                            <h5 style={{color: "#000"}}>{rare.name}</h5>
                                            <span className="badge bg-dark"><img src="https://lavvos.eu/swfs/monedas/0.png" /> {rare.price_diamonds}</span><br/>
                                            <span className="badge bg-primary"><img src="https://lavvos.eu/swfs/monedas/5.png" /> {rare.price_th}</span>
                                        </div>
                                    </div>
                                )}
                                </div>
                            }
                        </Tab>
                        <Tab eventKey="rares" title="Rares" style={{color: "var(--test-galaxytext)"}}>
                            { rares != null &&
                                <div className="row">
                                { rares.map((rare) => 
                                    <div className="col-md-3">
                                        <div className="text-center" style={{backgroundImage: "url(https://files.habboemotion.com/resources/images/homebgs/bg_colour_07.gif)", padding: "10px", borderRadius: "3px", marginBottom: "10px"}}>
                                            <img src={rare.image} style={{height: "120px", objectFit: "contain"}} />
                                            <h5 style={{color: "#000"}}>{rare.name}</h5>
                                            <span className="badge bg-dark"><img src="https://lavvos.eu/swfs/monedas/0.png" /> {rare.price_diamonds}</span><br/>
                                            <span className="badge bg-primary"><img src="https://lavvos.eu/swfs/monedas/5.png" /> {rare.price_th}</span>
                                        </div>
                                    </div>
                                )}
                                </div>
                            }
                        </Tab>
                        <Tab eventKey="megas" title="Megas" style={{color: "var(--test-galaxytext)"}}>
                            { megas != null &&
                                <div className="row">
                                { megas.map((rare) => 
                                    <div className="col-md-3">
                                        <div className="text-center" style={{backgroundImage: "url(https://files.habboemotion.com/resources/images/homebgs/bg_colour_07.gif)", padding: "10px", borderRadius: "3px", marginBottom: "10px"}}>
                                            <img src={rare.image} style={{height: "120px", objectFit: "contain"}} />
                                            <h5 style={{color: "#000"}}>{rare.name}</h5>
                                            <span className="badge bg-dark"><img src="https://lavvos.eu/swfs/monedas/0.png" /> {rare.price_diamonds}</span><br/>
                                            <span className="badge bg-primary"><img src="https://lavvos.eu/swfs/monedas/5.png" /> {rare.price_th}</span>
                                        </div>
                                    </div>
                                )}
                                </div>
                            }
                        </Tab>
                        <Tab eventKey="ultras" title="Ultras" style={{color: "var(--test-galaxytext)"}}>
                            { ultras != null &&
                                <div className="row">
                                { ultras.map((rare) => 
                                    <div className="col-md-3">
                                        <div className="text-center" style={{backgroundImage: "url(https://files.habboemotion.com/resources/images/homebgs/bg_colour_07.gif)", padding: "10px", borderRadius: "3px", marginBottom: "10px"}}>
                                            <img src={rare.image} style={{height: "120px", objectFit: "contain"}} />
                                            <h5 style={{color: "#000"}}>{rare.name}</h5>
                                            <span className="badge bg-dark"><img src="https://lavvos.eu/swfs/monedas/0.png" /> {rare.price_diamonds}</span><br/>
                                            <span className="badge bg-primary"><img src="https://lavvos.eu/swfs/monedas/5.png" /> {rare.price_th}</span>
                                        </div>
                                    </div>
                                )}
                                </div>
                            }
                        </Tab>
                        <Tab eventKey="buscar" title="Buscar" style={{color: "var(--test-galaxytext)"}}>
                            <div className="row" style={{marginBottom: "20px"}}>
                                <div className="col-md-10">
                                    <input type="text" onChange={e => setBusquedaString(e.target.value)} className="form-control" />
                                </div>
                                <div className="col-md-2">
                                    <button onClick={() => searchItem()} className="btn btn-primary w-100">Buscar</button>
                                </div>
                            </div>

                            { busqueda != null &&
                                <div className="row">
                                { busqueda.map((rare) => 
                                    <div className="col-md-3">
                                        <div className="text-center" style={{backgroundImage: "url(https://files.habboemotion.com/resources/images/homebgs/bg_colour_07.gif)", padding: "10px", borderRadius: "3px", marginBottom: "10px"}}>
                                            <img src={rare.image} style={{height: "120px", objectFit: "contain"}} />
                                            <h5 style={{color: "#000"}}>{rare.name}</h5>
                                            <span className="badge bg-dark"><img src="https://lavvos.eu/swfs/monedas/0.png" /> {rare.price_diamonds}</span><br/>
                                            <span className="badge bg-primary"><img src="https://lavvos.eu/swfs/monedas/5.png" /> {rare.price_th}</span>
                                        </div>
                                    </div>
                                )}
                                </div>
                            }
                        </Tab>
                    </Tabs>
                </NitroCardContentView>
            </NitroCardView>
            }
        </>
    );
}
