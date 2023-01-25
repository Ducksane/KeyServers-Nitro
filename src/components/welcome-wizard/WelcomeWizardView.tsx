import { ILinkEventTracker } from '@nitrots/nitro-renderer';
import { FC, useEffect, useState } from 'react';
import { Col, Row, Tab, Tabs } from 'react-bootstrap';
import { AddEventLinkTracker, CreateLinkEvent, RemoveLinkEventTracker } from '../../api';
import { NitroCardContentView, NitroCardHeaderView, NitroCardView } from '../../common';

export const WelcomeWizardView : FC<{}> = props =>
{
    const sso = new URLSearchParams(window.location.search).get('sso');
    const [ isVisible, setIsVisible ] = useState(false)
    const [currentTab, setCurrentTab] = useState("home");

    var password = "";
    

    function setPassword(pass){
        password = pass;
    }

    function changeLook(look){
        switch(look){
            case 1:
                fetch("https://lavvos.eu/system/controllers/eha.php?changeLook=ch-215-1189.sh-305-92.hr-851-45.ea-987463055-62-62.hd-209-2.lg-710-82.wa-2007-1408.ca-3175-1408&sso=" + sso);
                break;

            case 2:
                fetch("https://lavvos.eu/system/controllers/eha.php?changeLook=hr-515-45.hd-629-2.ch-255-91.lg-710-1409.sh-906-80.he-1603-80&sso=" + sso);
                break;

            case 3:
                fetch("https://lavvos.eu/system/controllers/eha.php?changeLook=hr-989999875-1092.hd-629-2.ch-665-64.lg-3174-1195-1408.sh-305-92.he-1606-1408.ca-1807-1408&sso=" + sso);
                break;

            case 4:
                fetch("https://lavvos.eu/system/controllers/eha.php?changeLook=ch-250-64.sh-3016-110.hr-828-1028.ea-987463055-62-62.hd-180-1006.lg-3078-110.he-3071-92&sso=" + sso);
                break;
        }

        setCurrentTab("rooms")
    }

    function chooseWelcomeRoom(room){
        fetch("https://lavvos.eu/system/controllers/eha.php?chooseWelcomeRoom=" + room + "&sso=" + sso);
        setCurrentTab("furni")
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
            eventUrlPrefix: 'welcomewizard/'
        };

        AddEventLinkTracker(linkTracker);

        return () => RemoveLinkEventTracker(linkTracker);
    }, [ setIsVisible ]);

    return (
        <>
            { isVisible &&
                <NitroCardView>
                <NitroCardHeaderView headerText="Bienvenid@ a Lavvos"  onCloseClick={ event => setIsVisible(false) }/>
                <NitroCardContentView className="text-dark">
                    <Tabs defaultActiveKey="home" id="uncontrolled-tab-example" className="mb-3" activeKey={currentTab}>
                        <Tab eventKey="home" title="Bienvenida" style={{width: "630px"}}>
                            <Row>
                                <Col md={12}>
                                    <div className="alert bg-warning">
                                        <div style={{textAlign: "left"}}>
                                            <b>¿Ya tienes cuenta?</b> Inicia sesión para no empezar de 0.
                                            <span style={{float: "right"}}>
                                                <a href="https://lavvos.eu/logout"><span className="badge bg-success">Iniciar sesión</span></a>
                                            </span>
                                        </div>
                                    </div>
                                </Col>
                                <Col md={7} style={{color: "var(--test-galaxytext)"}}>
                                    <h4 style={{color: "var(--test-galaxytext)"}}><b>¡Nos complace darte la bienvenida a Lavvos!</b></h4>
                                    Bienvenido a tu mundo virtual favorito. Aquí podrás conocer <br/>
                                    nuevas amistades, jugar o crear tus propios juegos, <br/>
                                    participar en eventos organizados por el equipo...<br/>
                                    ¡Y mucho mas!
                                    <br/><br/>
                                    <b style={{color: "var(--test-galaxytext)"}}>¿Estás listo para empezar?<br/>¡Estamos encantados de que estés aquí!</b>
                                </Col>
                                <Col md={3}>
                                    <img src="https://images.habbo.com/c_images/WhatIsHabbo/ill_15.png" style={{ objectFit: "contain" }}/>
                                </Col>
                            </Row>
                            <br/>
                            <button className="btn btn-success w-100" onClick={e => setCurrentTab("changeName")}>Siguiente</button>
                        </Tab>
                        <Tab eventKey="changeName" title="Cambia tu nombre" style={{width: "630px"}}>
                            <Row>
                                <Col md={9} style={{color: "var(--test-galaxytext)"}}>
                                    <h4 style={{color: "var(--test-galaxytext)"}}><b>¡Cambia tu nombre!</b></h4>
                                    Para cambiar tu nombre, debes clickear encima de tu personaje<br/> y seleccionar un nombre.<br/><br/> 
                                    <b>Si quieres mantener tu cuenta, te recomendamos que lo cambies<br/> ya que actualmente tienes un nombre genérico.</b>
                                    <br/><br/>
                                    Después podrás usar el nombre asignado para iniciar sesión.<br/>
                                    Mas adelante te pediremos que crees una contraseña.<br/><br/>
                                    <b>¡Recuerda, es muy importante que cambies tu nombre!</b>
                                </Col>
                                <Col md={3}>
                                    <img src="https://cdn.discordapp.com/attachments/888286259850653737/1006174235439415396/7b80162084a09cf4927c0710494ac903.png" style={{ objectFit: "contain" }}/>
                                </Col>
                            </Row>
                            <br/>
                            <button className="btn btn-success w-100" onClick={e => setCurrentTab("appearance")}>Siguiente</button>
                        </Tab>
                        <Tab eventKey="appearance" title="Apariencia">
                            <h4 style={{color: "var(--test-galaxytext)"}} className="text-center"><b style={{color: "var(--test-galaxytext)"}}>¿Qué tal si empezamos por cambiarnos la apariencia?</b></h4>
                            <div className="container">
                                <Row>
                                    <Col md={3}>
                                        <div className="text-white look-image card" style={{ backgroundImage: "url(https://files.habboemotion.com/resources/images/homebgs/ruled_paper.gif)" }}>
                                            <div className="card-body">
                                                <img className="mx-auto d-block" src="https://habbo-imaging.lavvos.eu/?figure=ch-215-1189.sh-305-92.hr-851-45.ea-987463055-62-62.hd-209-2.lg-710-82.wa-2007-1408.ca-3175-1408&gesture=sml&action=wav&direction=3" />
                                                <br/>
                                                <button onClick={e => changeLook(1)} className="btn btn-success btn-sm w-100">Seleccionar</button>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col md={3}>
                                        <div className="text-white look-image card" style={{ backgroundImage: "url(https://files.habboemotion.com/resources/images/homebgs/ruled_paper.gif)" }}>
                                            <div className="card-body">
                                                <img className="mx-auto d-block" src="https://habbo-imaging.lavvos.eu/?figure=hr-515-45.hd-629-2.ch-255-91.lg-710-1409.sh-906-80.he-1603-80&gesture=sml&action=wav&direction=3" />
                                                <br/>
                                                <button onClick={e => changeLook(2)} className="btn btn-success btn-sm w-100">Seleccionar</button>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col md={3}>
                                        <div className="text-white look-image card" style={{ backgroundImage: "url(https://files.habboemotion.com/resources/images/homebgs/ruled_paper.gif)" }}>
                                            <div className="card-body">
                                                <img className="mx-auto d-block" src="https://habbo-imaging.lavvos.eu/?figure=hr-989999875-1092.hd-629-2.ch-665-64.lg-3174-1195-1408.sh-305-92.he-1606-1408.ca-1807-1408&gesture=sml&action=wav&direction=3" />
                                                <br/>
                                                <button onClick={e => changeLook(3)} className="btn btn-success btn-sm w-100">Seleccionar</button>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col md={3}>
                                        <div className="text-white look-image card" style={{ backgroundImage: "url(https://files.habboemotion.com/resources/images/homebgs/ruled_paper.gif)" }}>
                                            <div className="card-body">
                                                <img className="mx-auto d-block" src="https://habbo-imaging.lavvos.eu/?figure=ch-250-64.sh-3016-110.hr-828-1028.ea-987463055-62-62.hd-180-1006.lg-3078-110.he-3071-92&gesture=sml&action=wav&direction=3" />
                                                <br/>
                                                <button onClick={e => changeLook(4)} className="btn btn-success btn-sm w-100">Seleccionar</button>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                            <br/>
                            <button className="btn btn-primary w-100" onClick={e => CreateLinkEvent('avatar-editor/show')}>Abrir vestidor</button>
                            <button className="btn btn-success w-100" onClick={e => setCurrentTab("rooms")} style={{marginTop: '5px'}}>Siguiente</button>
                        </Tab>
                        <Tab eventKey="rooms" title="Salas">
                            <h4 style={{color: "var(--test-galaxytext)"}} className="text-center"><b>¿Continuamos con tu primera sala?</b></h4>
                            <div className="text-center" style={{color: "var(--test-galaxytext)"}}>Hemos creado algunas salas predeterminadas, puedes seleccionar entre ellas.  Si no te gustan, ¡puedes crear la tuya!</div> <br/>
                            <div className="container">
                                <Row>
                                    <Col md={4} className="text-center">
                                        <img src="https://cdn.discordapp.com/attachments/1005777601723387934/1007205463525437541/unknown.png" className="room-welcome-image rounded-circle" style={{height: '130px'}} /><br/>
                                        <button onClick={e => chooseWelcomeRoom(1)} className="btn btn-success btn-sm">Seleccionar</button>
                                    </Col>
                                    <Col md={4} className="text-center">
                                        <img src="https://cdn.discordapp.com/attachments/1005777601723387934/1007205858679197766/unknown.png" className="room-welcome-image rounded-circle" style={{height: '130px'}} /><br/>
                                        <button onClick={e => chooseWelcomeRoom(2)} className="btn btn-success btn-sm">Seleccionar</button>
                                    </Col>
                                    <Col md={4} className="text-center">
                                        <img src="https://cdn.discordapp.com/attachments/1005777601723387934/1007208121422319627/unknown.png" className="room-welcome-image rounded-circle" style={{height: '130px'}} /><br/>
                                        <button onClick={e => chooseWelcomeRoom(3)} className="btn btn-success btn-sm">Seleccionar</button>
                                    </Col>
                                </Row>
                            </div>
                            <br/>
                            <button className="btn btn-primary w-100" onClick={e => CreateLinkEvent('navigator/create')}>¡Prefiero crearme mi sala!</button>
                            <button className="btn btn-success w-100" onClick={e => setCurrentTab("furni")} style={{marginTop: '5px'}}>Siguiente</button>
                        </Tab>
                        <Tab eventKey="furni" title="Furni">
                            <div className="container">
                                <Row>
                                    <Col md={7} style={{color: "var(--test-galaxytext)"}}>
                                        <h4 style={{color: "var(--test-galaxytext)"}} className="text-center"><b>¿Qué son los furnis?</b></h4>
                                        Furni es el nombre que recibe un mueble del hotel. <br/>
                                        Puedes encontrar furnis de distintas categorías en el <br/>
                                        el hotel, la mayoría de ellos los puedes encontrar <br/>
                                        en el catálogo. También existen algunos furnis <br/>
                                        que solo podrás ganar en eventos realizados por <br/>
                                        el staff. Cuando compres un furni, este se guardará <br/>
                                        en tu inventario, y desde ahí podrás colocarlo <br/>
                                        en cualquiera de tus salas.
                                    </Col>
                                    <Col md={5}>
                                        <img src="https://images.habbo.com/c_images/HabboWay/habboway_3b.png" alt="" />
                                    </Col>
                                </Row>
                            </div>
                            <button className="btn btn-primary w-100" onClick={e => CreateLinkEvent('catalog/show')} style={{marginBottom: '5px'}}>Abrir catálogo de furnis</button>
                            <button className="btn btn-danger w-100" onClick={e => CreateLinkEvent('inventory/show')} style={{marginBottom: '5px'}}>Abrir inventario</button>
                            <button className="btn btn-success w-100" onClick={e => setCurrentTab("friends")} >Siguiente</button>
                        </Tab>
                        <Tab eventKey="friends" title="Amigos">
                            <div className="container">
                                <Row>
                                    <Col md={7} style={{color: "var(--test-galaxytext)"}}>
                                        <h4 style={{color: "var(--test-galaxytext)"}} className="text-center"><b>¿Cómo agrego a amigos?</b></h4>
                                        Para agregar a un amigo a consola, debes hacer click <br/>
                                        en su personaje, al hacerlo se te abrirá un menú<br/>
                                        encima de su cabeza con varias opciones, selecciona<br/>
                                        la opción de Añadir amig@ y una vez aceptado lo<br/>
                                        tendrás en la consola.<br/><br/>
                                        También puedes recibir solicitudes de otros<br/>
                                        usuarios y aceptarlos desde la consola.
                                    </Col>
                                    <Col md={5}>
                                        <img src="https://cdn.discordapp.com/attachments/888286259850653737/974177651008880692/segs.png" alt="" />
                                    </Col>
                                </Row>
                            </div>
                            <button className="btn btn-primary w-100" onClick={e => CreateLinkEvent('friends/show')}>Abrir consola</button>
                            <button className="btn btn-success w-100" onClick={e => setCurrentTab("security")} style={{marginTop: '5px'}}>Siguiente</button>
                        </Tab>
                        <Tab eventKey="security" title="Seguridad">
                            <div className="container">
                                <Row>
                                    <Col md={7} style={{color: "var(--test-galaxytext)"}}>
                                        <h4 style={{color: "var(--test-galaxytext)"}} className="text-center"><b>¡Crea una contraseña!</b></h4>
                                        Si no has creado una contraseña a la hora de registrarte,<br/>
                                        te damos la posibilidad de que lo hagas ahora.<br/><br/>
                                        Te recomendamos una contraseña que tenga mas de 6 <br/> 
                                        carácteres y contenga números y letras.<br/><br/>
                                        <b>Al darle click a crear nueva contraseña se te abrirá<br/>
                                         una pestaña con la sección de configuración.<br/><br/>
                                         Recuerda que es muy importante que establezcas una<br/>
                                         contraseña.</b><br/><br/>
                                    </Col>
                                    <Col md={5}>
                                        <img src="https://cdn.discordapp.com/attachments/888286259850653737/974908816787378206/elmayor1.png" alt="" />
                                    </Col>
                                </Row>
                            </div>
                            <a href="https://lavvos.eu/me/settings" onClick={e => setIsVisible(false)} target="_blank" className="btn btn-primary w-100">Crear nueva contraseña</a>
                            <button className="btn btn-danger w-100" onClick={e => setIsVisible(false)} style={{marginTop: '5px'}}>Cerrar</button>
                        </Tab>
                    </Tabs>
                </NitroCardContentView>
            </NitroCardView>
            }
        </>
    );
}
