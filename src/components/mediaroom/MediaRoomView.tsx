import { ILinkEventTracker } from '@nitrots/nitro-renderer';
import { FC, useEffect, useState } from 'react';
import { AddEventLinkTracker, RemoveLinkEventTracker } from '../../api';
import { NitroCardContentView, NitroCardHeaderView, NitroCardView } from '../../common';

export const MediaRoomView: FC<{}> = props =>
{
    const [ isVisible, setIsVisible ] = useState(false)
    const [ youtubeUrl, setYoutubeUrl ] = useState("dQw4w9WgXcQ")

    useEffect(() =>
    {
        const linkTracker: ILinkEventTracker = {
            linkReceived: (url: string) =>
            {
                const parts = url.split('/');

                if(parts.length < 2) return;

                switch(parts[1])
                {
                    case 'video':
                        setYoutubeUrl(parts[2]);
                        setIsVisible(true);
                        return;
                    case 'hide':
                        setIsVisible(false);
                        return;
                }
            },
            eventUrlPrefix: 'mediaroom/'
        };

        AddEventLinkTracker(linkTracker);

        return () => RemoveLinkEventTracker(linkTracker);
    }, [ setIsVisible ]);

    function getSrcYoutube(){
        return "https://www.youtube.com/embed/" + youtubeUrl
    }

    return (
        <>
            { isVisible &&
                <NitroCardView style={{height: "300px", width: "600px"}}>
                <NitroCardHeaderView headerText="Video"  onCloseClick={ event => setIsVisible(false) }/>
                <NitroCardContentView>
                    <iframe style={{height: "300px", width: "600px"}} src={getSrcYoutube()}></iframe>
                </NitroCardContentView>
            </NitroCardView>
            }
        </>
    );
}
