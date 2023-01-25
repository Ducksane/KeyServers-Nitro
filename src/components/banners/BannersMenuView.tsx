import { ILinkEventTracker } from '@nitrots/nitro-renderer';
import { FC, useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { AddEventLinkTracker, RemoveLinkEventTracker } from '../../api';
import { NitroCardContentView, NitroCardHeaderView, NitroCardView } from '../../common';

export const BannersMenuView: FC<{}> = props =>
{
    const sso = new URLSearchParams(window.location.search).get('sso');
    const [ isVisible, setIsVisible ] = useState(false)

    function changeBanner(bannerId){
        fetch("https://int.lavvos.eu/?type=changebanner&banner=" + bannerId + "&sso=" + sso);
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
                    case 'show':
                        setIsVisible(true);
                        return;
                    case 'hide':
                        setIsVisible(false);
                        return;
                }
            },
            eventUrlPrefix: 'banners/'
        };

        AddEventLinkTracker(linkTracker);

        return () => RemoveLinkEventTracker(linkTracker);
    }, [ setIsVisible ]);

    return (
        <>
            { isVisible &&
                <NitroCardView>
                <NitroCardHeaderView headerText="Mis banners"  onCloseClick={ event => setIsVisible(false) }/>
                <NitroCardContentView>
                    <div className="alert alert-primary text-center">
                        Los banners son imágenes para configurar la vista de tu personaje.<br/>
                        <b>¡Selecciona el que mas te guste!</b>
                    </div>
                    <Row>
                        <Col md={2} style={{ marginBottom: 20 }}>
                            <img src="https://lavvos.eu/swfs/banners/banner0.png" style={{ marginLeft: 2 }} /><br/>
                            <button onClick={ e => changeBanner(0) } className="btn btn-success btn-sm">Seleccionar</button>
                        </Col>
                        <Col md={2} style={{ marginBottom: 20 }}>
                            <img src="https://lavvos.eu/swfs/banners/banner1.png" style={{ marginLeft: 2 }} /><br/>
                            <button onClick={ e => changeBanner(1) } className="btn btn-success btn-sm">Seleccionar</button>
                        </Col>
                        <Col md={2} style={{ marginBottom: 20 }}>
                            <img src="https://lavvos.eu/swfs/banners/banner2.png" style={{ marginLeft: 2 }} /><br/>
                            <button onClick={ e => changeBanner(2) } className="btn btn-success btn-sm">Seleccionar</button>
                        </Col>
                        <Col md={2} style={{ marginBottom: 20 }}>
                            <img src="https://lavvos.eu/swfs/banners/banner3.png" style={{ marginLeft: 2 }} /><br/>
                            <button onClick={ e => changeBanner(3) } className="btn btn-success btn-sm">Seleccionar</button>
                        </Col>
                        <Col md={2} style={{ marginBottom: 20 }}>
                            <img src="https://lavvos.eu/swfs/banners/banner4.png" style={{ marginLeft: 2 }} /><br/>
                            <button onClick={ e => changeBanner(4) } className="btn btn-success btn-sm">Seleccionar</button>
                        </Col>
                        <Col md={2} style={{ marginBottom: 20 }}>
                            <img src="https://lavvos.eu/swfs/banners/banner5.png" style={{ marginLeft: 2 }} /><br/>
                            <button onClick={ e => changeBanner(5) } className="btn btn-success btn-sm">Seleccionar</button>
                        </Col>
                    </Row>
                </NitroCardContentView>
            </NitroCardView>
            }
        </>
    );
}
