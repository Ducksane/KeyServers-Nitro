import { HabboClubLevelEnum, RoomControllerLevel } from '@nitrots/nitro-renderer';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { GetClubMemberLevel, GetConfiguration, GetRoomSession, GetSessionDataManager, LocalizeText, RoomWidgetChatMessage, RoomWidgetChatTypingMessage, RoomWidgetFloodControlEvent, RoomWidgetUpdateChatInputContentEvent, RoomWidgetUpdateInfostandUserEvent, RoomWidgetUpdateRoomObjectEvent } from '../../../../api';
import { Text } from '../../../../common';
import { UseEventDispatcherHook } from '../../../../hooks';
import { useRoomContext } from '../../RoomContext';
import { ChatInputEmojisSelectorView } from './ChatInputEmojisSelectorView';
import { ChatInputStickersSelectorView } from './ChatInputStickersSelectorView';
import { ChatInputStyleSelectorView } from './ChatInputStyleSelectorView';

export const ChatInputView: FC<{}> = props =>
{
    const [ chatValue, setChatValue ] = useState<string>('');
    const [ selectedUsername, setSelectedUsername ] = useState('');
    const [ isTyping, setIsTyping ] = useState(false);
    const [ typingStartedSent, setTypingStartedSent ] = useState(false);
    const [ isIdle, setIsIdle ] = useState(false);
    const [ chatStyleId, setChatStyleId ] = useState(GetSessionDataManager().chatStyle);
    const [ needsChatStyleUpdate, setNeedsChatStyleUpdate ] = useState(false);
    const [ floodBlocked, setFloodBlocked ] = useState(false);
    const [ floodBlockedSeconds, setFloodBlockedSeconds ] = useState(0);
    const { eventDispatcher = null, widgetHandler = null } = useRoomContext();
    const inputRef = useRef<HTMLInputElement>();

    var mediaRecorder;
    var audioChunks = [];

    var deletedAudio = false;
    
    function startRecording(){
        var microphoneOn = document.getElementById("microphoneOn");
        var microphoneOff = document.getElementById("microphoneOff");
        var deleteAudio = document.getElementById("deleteAudio");
        
        microphoneOn.style.display = "none";
        microphoneOff.style.display = "inline-block";
        deleteAudio.style.display = "inline-block";
        
        navigator.mediaDevices.getUserMedia({audio:true})
            .then(stream=> {
                mediaRecorder = new MediaRecorder(stream);
                mediaRecorder.start();

                mediaRecorder.addEventListener("dataavailable", event => {
                    audioChunks.push(event.data);
                });

                mediaRecorder.addEventListener("stop", () => {
                    microphoneOn.style.display = "inline-block";
                    microphoneOff.style.display = "none";
                    deleteAudio.style.display = "none";

                    if(!deletedAudio){
                        const audioBlob = new Blob(audioChunks);
                        if(audioBlob.size < 378461){
                            var fd = new FormData();
                            fd.append("audio", audioBlob);

                            fetch("https://int.lavvos.eu/audio", {method:"POST", body: fd})
                                .then((response) => response.text())
                                .then((resp) => {
                                    sendMessage("https://int.lavvos.eu/audios/" + resp + ".mp3", RoomWidgetChatMessage.CHAT_DEFAULT, '', 0);
                                })
                        }
                        else sendMessage("No puedes subir un audio tan largo.", RoomWidgetChatMessage.CHAT_DEFAULT, '', 0);
                    }
                    
                    deletedAudio = false;
                    audioChunks = [];
                });
            })
    }

    function stopRecording(){
        mediaRecorder.stop();
    }

    function deleteRecording(){
        deletedAudio = true;
        mediaRecorder.stop();
    }

    function showSubMenu(){
        if(document.getElementById("submenuChat").style.display == "block") document.getElementById("submenuChat").style.display = "none";
        else document.getElementById("submenuChat").style.display = "block"; 
    }

    function hideSubMenu(){
        document.getElementById("submenuChat").style.display = "none";
    }


    const chatModeIdWhisper = useMemo(() =>
    {
        return LocalizeText('widgets.chatinput.mode.whisper');
    }, []);

    const chatModeIdShout = useMemo(() =>
    {
        return LocalizeText('widgets.chatinput.mode.shout');
    }, []);

    const chatModeIdSpeak = useMemo(() =>
    {
        return LocalizeText('widgets.chatinput.mode.speak');
    }, []);

    const maxChatLength = useMemo(() =>
    {
        return GetConfiguration<number>('chat.input.maxlength', 100);
    }, []);

    const anotherInputHasFocus = useCallback(() =>
    {
        const activeElement = document.activeElement;

        if(!activeElement) return false;

        if(inputRef && (inputRef.current === activeElement)) return false;

        if(!(activeElement instanceof HTMLInputElement) && !(activeElement instanceof HTMLTextAreaElement)) return false;

        return true;
    }, [ inputRef ]);

    const sendMessage = useCallback((text: string, chatType: number, recipientName: string = '', styleId: number = 0) =>
    {
        widgetHandler.processWidgetMessage(new RoomWidgetChatMessage(RoomWidgetChatMessage.MESSAGE_CHAT, text, chatType, recipientName, styleId));
    }, [ widgetHandler ]);

    const setInputFocus = useCallback(() =>
    {
        inputRef.current.focus();

        inputRef.current.setSelectionRange((inputRef.current.value.length * 2), (inputRef.current.value.length * 2));
    }, [ inputRef ]);

    const checkSpecialKeywordForInput = useCallback(() =>
    {
        setChatValue(prevValue =>
        {
            if((prevValue !== chatModeIdWhisper) || !selectedUsername.length) return prevValue;

            return (`${ prevValue } ${ selectedUsername }`);
        });
    }, [ selectedUsername, chatModeIdWhisper ]);

    const sendChat = useCallback((text: string, chatType: number, recipientName: string = '', styleId: number = 0) =>
    {
        setChatValue('');

        widgetHandler.processWidgetMessage(new RoomWidgetChatMessage(RoomWidgetChatMessage.MESSAGE_CHAT, text, chatType, recipientName, styleId));
    }, [ widgetHandler ]);

    const sendChatValue = useCallback((value: string, shiftKey: boolean = false) =>
    {
        if(!value || (value === '')) return;

        let chatType = (shiftKey ? RoomWidgetChatMessage.CHAT_SHOUT : RoomWidgetChatMessage.CHAT_DEFAULT);
        let text = value;

        const parts = text.split(' ');

        let recipientName = '';
        let append = '';

        switch(parts[0])
        {
            case chatModeIdWhisper:
                chatType = RoomWidgetChatMessage.CHAT_WHISPER;
                recipientName = parts[1];
                append = (chatModeIdWhisper + ' ' + recipientName + ' ');

                parts.shift();
                parts.shift();
                break;
            case chatModeIdShout:
                chatType = RoomWidgetChatMessage.CHAT_SHOUT;

                parts.shift();
                break;
            case chatModeIdSpeak:
                chatType = RoomWidgetChatMessage.CHAT_DEFAULT;

                parts.shift();
                break;
        }

        text = parts.join(' ');

        setIsTyping(false);
        setIsIdle(false);

        if(text.length <= maxChatLength)
        {
            if(needsChatStyleUpdate)
            {
                GetSessionDataManager().sendChatStyleUpdate(chatStyleId);

                setNeedsChatStyleUpdate(false);
            }

            sendChat(text, chatType, recipientName, chatStyleId);
        }

        setChatValue(append);
    }, [ chatModeIdWhisper, chatModeIdShout, chatModeIdSpeak, maxChatLength, chatStyleId, needsChatStyleUpdate, sendChat ]);

    const updateChatInput = useCallback((value: string) =>
    {
        if(!value || !value.length)
        {
            setIsTyping(false);
        }
        else
        {
            setIsTyping(true);
            setIsIdle(true);
        }

        setChatValue(value);
    }, []);

    const onKeyDownEvent = useCallback((event: KeyboardEvent) =>
    {
        if(floodBlocked || !inputRef.current || anotherInputHasFocus()) return;

        if(document.activeElement !== inputRef.current) setInputFocus();

        const value = (event.target as HTMLInputElement).value;

        switch(event.key)
        {
            case ' ':
            case 'Space':
                checkSpecialKeywordForInput();
                return;
            case 'NumpadEnter':
            case 'Enter':
                sendChatValue(value, event.shiftKey);
                return;
            case 'Backspace':
                if(value)
                {
                    const parts = value.split(' ');

                    if((parts[0] === chatModeIdWhisper) && (parts.length === 3) && (parts[2] === ''))
                    {
                        setChatValue('');
                    }
                }
                return;
        }
        
    }, [ floodBlocked, inputRef, chatModeIdWhisper, anotherInputHasFocus, setInputFocus, checkSpecialKeywordForInput, sendChatValue ]);

    const onRoomWidgetRoomObjectUpdateEvent = useCallback((event: RoomWidgetUpdateRoomObjectEvent) =>
    {
        setSelectedUsername('');
    }, []);

    UseEventDispatcherHook(RoomWidgetUpdateRoomObjectEvent.OBJECT_DESELECTED, eventDispatcher, onRoomWidgetRoomObjectUpdateEvent);

    const onRoomWidgetUpdateInfostandUserEvent = useCallback((event: RoomWidgetUpdateInfostandUserEvent) =>
    {
        setSelectedUsername(event.name);
    }, []);

    UseEventDispatcherHook(RoomWidgetUpdateInfostandUserEvent.PEER, eventDispatcher, onRoomWidgetUpdateInfostandUserEvent);

    const onRoomWidgetChatInputContentUpdateEvent = useCallback((event: RoomWidgetUpdateChatInputContentEvent) =>
    {
        switch(event.chatMode)
        {
            case RoomWidgetUpdateChatInputContentEvent.WHISPER: {
                setChatValue(`${ chatModeIdWhisper } ${ event.userName } `);
                return;
            }
            case RoomWidgetUpdateChatInputContentEvent.SHOUT:
                return;
        }
    }, [ chatModeIdWhisper ]);

    UseEventDispatcherHook(RoomWidgetUpdateChatInputContentEvent.CHAT_INPUT_CONTENT, eventDispatcher, onRoomWidgetChatInputContentUpdateEvent);

    const onRoomWidgetFloodControlEvent = useCallback((event: RoomWidgetFloodControlEvent) =>
    {
        setFloodBlocked(true);
        setFloodBlockedSeconds(event.seconds);
    }, []);

    UseEventDispatcherHook(RoomWidgetFloodControlEvent.FLOOD_CONTROL, eventDispatcher, onRoomWidgetFloodControlEvent);

    const selectChatStyleId = useCallback((styleId: number) =>
    {
        setChatStyleId(styleId);
        setNeedsChatStyleUpdate(true);
    }, []);

    const chatStyleIds = useMemo(() =>
    {
        let styleIds: number[] = [];

        const styles = GetConfiguration<{ styleId: number, minRank: number, isSystemStyle: boolean, isHcOnly: boolean, isAmbassadorOnly: boolean }[]>('chat.styles');

        for(const style of styles)
        {
            if(!style) continue;

            if(style.minRank > 0)
            {
                if(GetSessionDataManager().hasSecurity(style.minRank)) styleIds.push(style.styleId);

                continue;
            }

            if(style.isSystemStyle)
            {
                if(GetSessionDataManager().hasSecurity(RoomControllerLevel.MODERATOR))
                {
                    styleIds.push(style.styleId);

                    continue;
                }
            }

            if(GetConfiguration<number[]>('chat.styles.disabled').indexOf(style.styleId) >= 0) continue;

            if(style.isHcOnly && (GetClubMemberLevel() >= HabboClubLevelEnum.CLUB))
            {
                styleIds.push(style.styleId);

                continue;
            }

            if(style.isAmbassadorOnly && GetSessionDataManager().isAmbassador)
            {
                styleIds.push(style.styleId);

                continue;
            }

            if(!style.isHcOnly && !style.isAmbassadorOnly) styleIds.push(style.styleId);
        }

        return styleIds;
    }, []);

    useEffect(() =>
    {
        if(isTyping)
        {
            if(!typingStartedSent)
            {
                setTypingStartedSent(true);
                
                widgetHandler.processWidgetMessage(new RoomWidgetChatTypingMessage(isTyping));
            }
        }
        else
        {
            if(typingStartedSent)
            {
                setTypingStartedSent(false);

                widgetHandler.processWidgetMessage(new RoomWidgetChatTypingMessage(isTyping));
            }
        }
    }, [ widgetHandler, isTyping, typingStartedSent ]);

    useEffect(() =>
    {
        if(!isIdle) return;

        let timeout: ReturnType<typeof setTimeout> = null;

        if(isIdle)
        {
            timeout = setTimeout(() =>
            {
                setIsIdle(false);
                setIsTyping(false)
            }, 10000);
        }

        return () => clearTimeout(timeout);
    }, [ isIdle ]);

    useEffect(() =>
    {
        if(!floodBlocked) return;

        let seconds = 0;

        const interval = setInterval(() =>
        {
            setFloodBlockedSeconds(prevValue =>
            {
                seconds = ((prevValue || 0) - 1);

                return seconds;
            });

            if(seconds < 0)
            {
                clearInterval(interval);

                setFloodBlocked(false);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [ floodBlocked ])

    useEffect(() =>
    {
        document.body.addEventListener('keydown', onKeyDownEvent);

        return () =>
        {
            document.body.removeEventListener('keydown', onKeyDownEvent);
        }
    }, [ onKeyDownEvent ]);

    useEffect(() =>
    {
        if(!inputRef.current) return;

        inputRef.current.parentElement.dataset.value = chatValue;
    }, [ chatValue ]);

    if(GetRoomSession().isSpectator) return null;
    /*
    <ChatInputStyleSelectorView chatStyleId={ chatStyleId } chatStyleIds={ chatStyleIds } selectChatStyleId={ selectChatStyleId } />
                <ChatInputStickersSelectorView /> 
                <div id="microphoneOn" onClick={e => startRecording()} style={{marginLeft: "10px"}} className="icon chatmicrophone-on-icon" />
                <div id="microphoneOff" onClick={e => stopRecording()} style={{marginLeft: "10px", display: "none"}} className="icon chatmicrophone-off-icon" />
                <div id="deleteAudio" onClick={e => deleteRecording()} style={{marginLeft: "10px", display: "none"}} className="icon chatdeleteaudio-icon" />*/

    return (
        createPortal(
            <>
            <div id="submenuChat" className="animate__animated animate__fadeInUp" style={{paddingLeft: "16px", paddingRight: "13px", paddingTop: "11px", paddingBottom: "7px", position: "absolute", backgroundColor: "rgba(43, 43, 43, 0.8)", top: "-48px", borderRadius: "7px", display: "none", border: "1px #fff solid"}}> 
                <ChatInputStyleSelectorView chatStyleId={ chatStyleId } chatStyleIds={ chatStyleIds } selectChatStyleId={ selectChatStyleId } />
                <ChatInputStickersSelectorView /> 
                <ChatInputEmojisSelectorView />
                <div id="microphoneOn" onClick={e => startRecording()} style={{marginLeft: "10px", display: "inline-block"}} className="icon chatmicrophone-on-icon" />
                <div id="microphoneOff" onClick={e => stopRecording()} style={{marginLeft: "10px", display: "none"}} className="icon chatmicrophone-off-icon" />
                <div id="deleteAudio" onClick={e => deleteRecording()} style={{marginLeft: "10px", display: "none"}} className="icon chatdeleteaudio-icon" />
                <div onClick={() => hideSubMenu()} className="icon chatequis-icon" style={{marginLeft: "10px", display: "inline-block"}} />
            </div>
            <div className="nitro-chat-input-container" style={{height: "49px"}}>
                <div className="chat-size input-sizer align-items-center" style={{justifyContent: "start"}}>
                    <div onClick={() => showSubMenu()} className="icon chatmas-icon" style={{marginRight: "3px"}} />
                    { !floodBlocked &&
                    <input style={{marginLeft: "5px"}} ref={ inputRef } type="text" className="chat-input" placeholder={ LocalizeText('widgets.chatinput.default') } value={ chatValue } maxLength={ maxChatLength } onChange={ event => updateChatInput(event.target.value) } onMouseDown={ event => setInputFocus() } /> }
                    { floodBlocked &&
                    <Text variant="danger">{ LocalizeText('chat.input.alert.flood', [ 'time' ], [ floodBlockedSeconds.toString() ]) } </Text> }
                </div>
            </div>
            </>, document.getElementById('toolbar-chat-input-container'))
    );
}
function setSelectorVisible(arg0: boolean)
{
    throw new Error('Function not implemented.');
}
