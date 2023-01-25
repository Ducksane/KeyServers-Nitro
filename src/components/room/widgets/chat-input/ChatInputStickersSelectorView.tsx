import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FC, MouseEvent, useCallback, useEffect, useState } from 'react';
import { Button, Overlay, Popover } from 'react-bootstrap';
import { LocalizeText, RoomWidgetChatMessage } from '../../../../api';
import { Base, Flex, Grid, NitroCardContentView } from '../../../../common';
import { useRoomContext } from '../../RoomContext';

export const ChatInputStickersSelectorView: FC<{}> = props =>
{
    const [ target, setTarget ] = useState<(EventTarget & HTMLElement)>(null);
    const [ selectorVisible, setSelectorVisible ] = useState(false);
    const [ stickers, setStickers ] = useState(null)
    const [ stickersGiphy, setStickersGiphy ] = useState(null)
    const [ showNativeStickers, setShowNativeStickers ] = useState(true)
    const [ showGiphyStickers, setShowGiphyStickers ] = useState(false)
    const { eventDispatcher = null, widgetHandler = null } = useRoomContext();

    var evadeClosing = false;
    
    function searchStickers(strSearch)
    {
        evadeClosing = true;
        if(strSearch.length == 0){
            setShowGiphyStickers(false)
            setShowNativeStickers(true)
            return;
        }

        fetch('https://api.giphy.com/v1/gifs/search?api_key=4qwMrfzYMYVl1lhhl3wDaVxDNWAzAv6s&q=' + strSearch + '&limit=25&offset=0&rating=g&lang=en')
            .then((response) => response.json())
            .then((result) => 
            {
                setStickersGiphy(result);
                setShowNativeStickers(false)
                setShowGiphyStickers(true)
            })
    }

    function sendSticker(sticker){
        const stickerArgs = sticker.split(".gif");
        sendChat(stickerArgs[0], RoomWidgetChatMessage.CHAT_DEFAULT, '', 2)
    }

    function NativeStickers(){
        if(stickers == null) return null;
        else return(
            <div></div>
        );
    }

    function GiphyStickers(){
        if(stickersGiphy == null) return null;
        else return(
            <Grid columnCount={ 4 } overflow="auto" id="giphyStickers">
                { stickersGiphy.data.map(sticker => (
                    // eslint-disable-next-line react/jsx-key
                    <Base key={ sticker.images.downsized_medium.url}>
                        <img src={ sticker.images.downsized_medium.url } width={ 50 } height={ 50 } className="sticker-img" onClick={ e => sendSticker(sticker.images.fixed_height_small.url) }/>
                    </Base>
                )) }
            </Grid>
        );
    }

    const sendChat = useCallback((text: string, chatType: number, recipientName: string = '', styleId: number = 0) =>
    {
        widgetHandler.processWidgetMessage(new RoomWidgetChatMessage(RoomWidgetChatMessage.MESSAGE_CHAT, text, chatType, recipientName, styleId));
        setSelectorVisible(false)
    }, [ widgetHandler ]);

    const toggleSelector = (event: MouseEvent<HTMLElement>) =>
    {
        if(evadeClosing) return;
        let visible = true;

        setSelectorVisible(prevValue =>
        {
            visible = !prevValue;

            return visible;
        });

        if(visible) setTarget((event.target as (EventTarget & HTMLElement)));
        evadeClosing = false;
    }

    function handleClose(){
        evadeClosing = true;
    }

    var inputText = "";
    function onChangeInput(value){
        inputText = value;
    }

    useEffect(() =>
    {
        if(selectorVisible) return;

        setTarget(null);
    }, [ selectorVisible ]);

    return (
        <>
            <Base pointer className="icon chatstickers-icon" onClick={ toggleSelector } style={{ marginLeft: "13px", display: "inline-block"}}>
                <Overlay show={ selectorVisible } target={ target } placement="top">
                    <Popover className="nitro-chat-sticker-selector-container image-rendering-pixelated">
                        <NitroCardContentView overflow="hidden" className="bg-transparent">
                            <Flex gap={ 1 }>
                                <input onClick={e => handleClose()} onChange={ e => onChangeInput(e.target.value) } type="text" className="form-control form-control-sm" placeholder={ LocalizeText('generic.search') } />
                                <Button variant="primary" className="stickers-search-button" onClick={e => searchStickers(inputText)}>
                                    <FontAwesomeIcon icon="search" />
                                </Button>
                            </Flex>
                            { showNativeStickers ? <NativeStickers /> : null }
                            { showGiphyStickers ? <GiphyStickers /> : null }
                        </NitroCardContentView>
                    </Popover>
                </Overlay>
            </Base>
        </>
    );
}
