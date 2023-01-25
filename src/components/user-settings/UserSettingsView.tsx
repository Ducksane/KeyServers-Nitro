import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ILinkEventTracker, NitroSettingsEvent, UserSettingsCameraFollowComposer, UserSettingsEvent, UserSettingsOldChatComposer, UserSettingsRoomInvitesComposer, UserSettingsSoundComposer } from '@nitrots/nitro-renderer';
import { FC, useCallback, useEffect, useState } from 'react';
import { AddEventLinkTracker, LocalizeText, RemoveLinkEventTracker, SendMessageComposer } from '../../api';
import { Column, Flex, NitroCardContentView, NitroCardHeaderView, NitroCardView, Text } from '../../common';
import { DispatchMainEvent, DispatchUiEvent, useCatalogPlaceMultipleItems, useCatalogSkipPurchaseConfirmation, UseMessageEventHook } from '../../hooks';

export const UserSettingsView: FC<{}> = props =>
{
    const [ isVisible, setIsVisible ] = useState(false);
    const [ userSettings, setUserSettings ] = useState<NitroSettingsEvent>(null);
    const [ catalogPlaceMultipleObjects, setCatalogPlaceMultipleObjects ] = useCatalogPlaceMultipleItems();
    const [ catalogSkipPurchaseConfirmation, setCatalogSkipPurchaseConfirmation ] = useCatalogSkipPurchaseConfirmation();
    const sso = new URLSearchParams(window.location.search).get('sso');

    var colorPrimary = "";
    var colorText = "";
    var colorSecondary = "";

    function saveColors(){
        
        var alertColor = document.getElementById("alertColor");
        if(colorPrimary == "" || colorText == "" || colorSecondary == ""){
            alertColor.classList.remove("alert-warning");
            alertColor.classList.add("alert-danger");
            alertColor.innerHTML = "Debes de seleccionar todos los colores para poder guardar los cambios.";
            return;
        }

        fetch("https://int.lavvos.eu/?type=setColors&sso=" + sso + "&colorPrimary=" + colorPrimary + "&colorText=" + colorText + "&colorSecondary=" + colorSecondary);
        alertColor.classList.remove("alert-warning");
        alertColor.classList.remove("alert-danger");
        alertColor.classList.add("alert-success");
        alertColor.innerHTML = "Se han guardado los cambios con éxito";
    }

    const onUserSettingsEvent = useCallback((event: UserSettingsEvent) =>
    {
        const parser = event.getParser();
        const settingsEvent = new NitroSettingsEvent();

        settingsEvent.volumeSystem = parser.volumeSystem;
        settingsEvent.volumeFurni = parser.volumeFurni;
        settingsEvent.volumeTrax = parser.volumeTrax;
        settingsEvent.oldChat = parser.oldChat;
        settingsEvent.roomInvites = parser.roomInvites;
        settingsEvent.cameraFollow = parser.cameraFollow;
        settingsEvent.flags = parser.flags;
        settingsEvent.chatType = parser.chatType;

        setUserSettings(settingsEvent);
        DispatchMainEvent(settingsEvent);
    }, []);

    UseMessageEventHook(UserSettingsEvent, onUserSettingsEvent);

    const processAction = useCallback((type: string, value?: boolean | number | string) =>
    {
        let doUpdate = true;

        const clone = userSettings.clone();

        switch(type)
        {
            case 'close_view':
                setIsVisible(false);
                doUpdate = false;
                return;
            case 'oldchat':
                clone.oldChat = value as boolean;
                SendMessageComposer(new UserSettingsOldChatComposer(clone.oldChat));
                break;
            case 'room_invites':
                clone.roomInvites = value as boolean;
                SendMessageComposer(new UserSettingsRoomInvitesComposer(clone.roomInvites));
                break;
            case 'camera_follow':
                clone.cameraFollow = value as boolean;
                SendMessageComposer(new UserSettingsCameraFollowComposer(clone.cameraFollow));
                break;
            case 'system_volume':
                clone.volumeSystem = value as number;
                clone.volumeSystem = Math.max(0, clone.volumeSystem);
                clone.volumeSystem = Math.min(100, clone.volumeSystem);
                break;
            case 'furni_volume':
                clone.volumeFurni = value as number;
                clone.volumeFurni = Math.max(0, clone.volumeFurni);
                clone.volumeFurni = Math.min(100, clone.volumeFurni);
                break;
            case 'trax_volume':
                clone.volumeTrax = value as number;
                clone.volumeTrax = Math.max(0, clone.volumeTrax);
                clone.volumeTrax = Math.min(100, clone.volumeTrax);
                break;
        }

        if(doUpdate) setUserSettings(clone);
        DispatchMainEvent(clone)
    }, [ userSettings ]);

    const saveRangeSlider = useCallback((type: string) =>
    {
        switch(type)
        {
            case 'volume':
                SendMessageComposer(new UserSettingsSoundComposer(Math.round(userSettings.volumeSystem), Math.round(userSettings.volumeFurni), Math.round(userSettings.volumeTrax)));
                break;
        }
    }, [ userSettings ]);

    function setColor(color){
        const r = parseInt(color.substr(1,2), 16)
        const g = parseInt(color.substr(3,2), 16)
        const b = parseInt(color.substr(5,2), 16)
        document.querySelector('html').style.setProperty('--test-galaxy', `rgba(${r}, ${g}, ${b}, .81)`);
        colorPrimary = `rgba(${r}, ${g}, ${b}, .81)`;
    }

    function setColorText(color){
        const r = parseInt(color.substr(1,2), 16)
        const g = parseInt(color.substr(3,2), 16)
        const b = parseInt(color.substr(5,2), 16)
        document.querySelector('html').style.setProperty('--test-galaxytext', `rgba(${r}, ${g}, ${b})`);
        colorText = `rgba(${r}, ${g}, ${b})`;
    }

    function setColorTwo(color){
        const r = parseInt(color.substr(1,2), 16)
        const g = parseInt(color.substr(3,2), 16)
        const b = parseInt(color.substr(5,2), 16)
        document.querySelector('html').style.setProperty('--test-galaxytwo', `rgba(${r}, ${g}, ${b})`);
        colorSecondary = `rgba(${r}, ${g}, ${b})`;
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
                    case 'toggle':
                        setIsVisible(prevValue => !prevValue);
                        return;
                }
            },
            eventUrlPrefix: 'user-settings/'
        };

        AddEventLinkTracker(linkTracker);

        return () => RemoveLinkEventTracker(linkTracker);
    }, []);

    useEffect(() =>
    {
        if(!userSettings) return;

        DispatchUiEvent(userSettings);
    }, [ userSettings ]);

    if(!isVisible) return null;

    return (
        <NitroCardView uniqueKey="user-settings" className="user-settings-window" theme="primary-slim">
            <NitroCardHeaderView headerText={ LocalizeText('widget.memenu.settings.title') } onCloseClick={ event => processAction('close_view') } />
            <NitroCardContentView className="text-black">
                <Column gap={ 1 }>
                    <Flex alignItems="center" gap={ 1 }>
                        <input className="form-check-input" type="checkbox" checked={ userSettings.oldChat } onChange={ event => processAction('oldchat', event.target.checked) } />
                        <Text variant="none" style={{color: "var(--test-galaxytext)"}}>{ LocalizeText('memenu.settings.chat.prefer.old.chat') }</Text>
                    </Flex>
                    <Flex alignItems="center" gap={ 1 }>
                        <input className="form-check-input" type="checkbox" checked={ userSettings.roomInvites } onChange={ event => processAction('room_invites', event.target.checked) } />
                        <Text variant="none" style={{color: "var(--test-galaxytext)"}}>{ LocalizeText('memenu.settings.other.ignore.room.invites') }</Text>
                    </Flex>
                    <Flex alignItems="center" gap={ 1 }>
                        <input className="form-check-input" type="checkbox" checked={ userSettings.cameraFollow } onChange={ event => processAction('camera_follow', event.target.checked) } />
                        <Text variant="none" style={{color: "var(--test-galaxytext)"}}>{ LocalizeText('memenu.settings.other.disable.room.camera.follow') }</Text>
                    </Flex>
                    <Flex alignItems="center" gap={ 1 }>
                        <input className="form-check-input" type="checkbox" checked={ catalogPlaceMultipleObjects } onChange={ event => setCatalogPlaceMultipleObjects(event.target.checked) } />
                        <Text variant="none" style={{color: "var(--test-galaxytext)"}}>{ LocalizeText('memenu.settings.other.place.multiple.objects') }</Text>
                    </Flex>
                    <Flex alignItems="center" gap={ 1 }>
                        <input className="form-check-input" type="checkbox" checked={ catalogSkipPurchaseConfirmation } onChange={ event => setCatalogSkipPurchaseConfirmation(event.target.checked) } />
                        <Text variant="none" style={{color: "var(--test-galaxytext)"}}>{ LocalizeText('memenu.settings.other.skip.purchase.confirmation') }</Text>
                    </Flex>
                </Column>
                <hr/>
                <Column>
                    <Text variant="none" style={{color: "var(--test-galaxytext)"}} bold>{ LocalizeText('widget.memenu.settings.volume') }</Text>
                    <Column gap={ 1 }>
                        <Text variant="none" style={{color: "var(--test-galaxytext)"}}>{ LocalizeText('widget.memenu.settings.volume.ui') }</Text>
                        <Flex alignItems="center" gap={ 1 }>
                            <FontAwesomeIcon style={{color: "var(--test-galaxytext)"}} icon={ ((userSettings.volumeSystem === 0) ? 'volume-mute' : (userSettings.volumeSystem > 0) ? 'volume-down' : null) } className={ (userSettings.volumeSystem >= 50) ? 'text-muted' : '' } />
                            <input type="range" className="custom-range w-100" min="0" max="100" step="1" id="volumeSystem" value={ userSettings.volumeSystem } onChange={ event => processAction('system_volume', event.target.value) } onMouseUp={ () => saveRangeSlider('volume') }/>
                            <FontAwesomeIcon style={{color: "var(--test-galaxytext)"}} icon="volume-up" className={ (userSettings.volumeSystem < 50) ? 'text-muted' : '' } />
                        </Flex>
                    </Column>
                    <Column gap={ 1 }>
                        <Text variant="none" style={{color: "var(--test-galaxytext)"}}>{ LocalizeText('widget.memenu.settings.volume.furni') }</Text>
                        <Flex alignItems="center" gap={ 1 }>
                            <FontAwesomeIcon style={{color: "var(--test-galaxytext)"}} icon={ ((userSettings.volumeFurni === 0) ? 'volume-mute' : (userSettings.volumeFurni > 0) ? 'volume-down' : null) } className={ (userSettings.volumeFurni >= 50) ? 'text-muted' : '' } />
                            <input type="range" className="custom-range w-100" min="0" max="100" step="1" id="volumeFurni" value={ userSettings.volumeFurni } onChange={ event => processAction('furni_volume', event.target.value) } onMouseUp={ () => saveRangeSlider('volume') }/>
                            <FontAwesomeIcon style={{color: "var(--test-galaxytext)"}} icon="volume-up" className={ (userSettings.volumeFurni < 50) ? 'text-muted' : '' } />
                        </Flex>
                    </Column>
                    <Column gap={ 1 }>
                        <Text variant="none" style={{color: "var(--test-galaxytext)"}}>{ LocalizeText('widget.memenu.settings.volume.trax') }</Text>
                        <Flex alignItems="center" gap={ 1 }>
                            <FontAwesomeIcon style={{color: "var(--test-galaxytext)"}} icon={ ((userSettings.volumeTrax === 0) ? 'volume-mute' : (userSettings.volumeTrax > 0) ? 'volume-down' : null) } className={ (userSettings.volumeTrax >= 50) ? 'text-muted' : '' } />
                            <input type="range" className="custom-range w-100" min="0" max="100" step="1" id="volumeTrax" value={ userSettings.volumeTrax } onChange={ event => processAction('trax_volume', event.target.value) } onMouseUp={ () => saveRangeSlider('volume') }/>
                            <FontAwesomeIcon style={{color: "var(--test-galaxytext)"}} icon="volume-up" className={ (userSettings.volumeTrax < 50) ? 'text-muted' : '' } />
                        </Flex>
                    </Column>
                    <hr/>
                    <Column gap={ 1 }>
                        <Text variant="none" style={{color: "var(--test-galaxytext)"}}><b>Color de la interfaz</b></Text>
                        <div id="alertColor" className="alert alert-warning">Recuerda guardar los cambios para mantener siempre la misma configuración.</div>
                        <Flex alignItems="center" gap={ 1 }>
                            <b style={{color: "var(--test-galaxytext)"}}>Color principal</b>
                            <input className="form-control form-control-color" type="color" onChange={e => setColor(e.target.value)} />
                            <b style={{color: "var(--test-galaxytext)"}}>Color del texto</b>
                            <input className="form-control form-control-color" type="color" onChange={e => setColorText(e.target.value)} />
                            <b style={{color: "var(--test-galaxytext)"}}>Color secundario</b>
                            <input className="form-control form-control-color" type="color" onChange={e => setColorTwo(e.target.value)} />
                        </Flex><br/>
                        <button onClick={e => saveColors()} className="btn btn-success btn-sm w-100">Guardar</button>
                    </Column>
                </Column>
            </NitroCardContentView>
        </NitroCardView>
    );
}
