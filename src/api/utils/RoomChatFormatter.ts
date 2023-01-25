
const allowedColours: Map<string, string> = new Map();
allowedColours.set('r', 'red');
allowedColours.set('b', 'blue');
allowedColours.set('g', 'green');
allowedColours.set('y', 'yellow');
allowedColours.set('w', 'white');
allowedColours.set('o', 'orange');
allowedColours.set('c', 'cyan');
allowedColours.set('br', 'brown');
allowedColours.set('pr', 'purple');
allowedColours.set('pk', 'pink');

allowedColours.set('red', 'red');
allowedColours.set('blue', 'blue');
allowedColours.set('green', 'green');
allowedColours.set('yellow', 'yellow');
allowedColours.set('white', 'white');
allowedColours.set('orange', 'orange');
allowedColours.set('cyan', 'cyan');
allowedColours.set('brown', 'brown');
allowedColours.set('purple', 'purple');
allowedColours.set('pink', 'pink');

function encodeHTML(str: string)
{
    return str.replace(/([\u00A0-\u9999<>&])(.|$)/g, function(full, char, next) 
    {
        if(char !== '&' || next !== '#')
        {
            if(/[\u00A0-\u9999<>&]/.test(next))
                next = '&#' + next.charCodeAt(0) + ';';

            return '&#' + char.charCodeAt(0) + ';' + next;
        }

        return full;
    });
}


export function RoomChatFormatter(content: string, styleId: number): string
{
    let result = '';

    /*const styles = [1, 2, 33, 34];
    if(!styles.includes(styleId)){
        content = encodeHTML(content)
        content = (joypixels.shortnameToUnicode(content) as string)
    }*/

    if (content.toLowerCase().includes("onerror="))
        content = "kekw";
    if (content.toLowerCase().includes("javascript:"))
        content = "kekw";
    if (content.toLowerCase().includes("onmouseover="))
        content = "kekw";
    if (content.toLowerCase().includes("<audio") && content.toLowerCase().includes("<img"))
        content = "kekw";
    if (content.toLowerCase().includes("<audio") && content.toLowerCase().includes("<h"))
        content = "kekw";
    if (content.toLowerCase().includes("<script"))
        content = "kekw";

    if(content.includes("giphy.com/media")){
        content = "<img src='" + content + ".gif' style='max-width: 150px; object-fit: contain;'/>";
    }

    if(content.includes("lavvos.eu/swfs/c_images/emojis/emoji")){
        content = "<img src='" + content + "'/>";
    }

    if(content.includes("https://int.lavvos.eu/audios/")){
        content = "<audio style='height: 20px; position: relative; top: 3px;' controls src='" + content + "'/>";
    }

    if(content.startsWith('@') && content.indexOf('@', 1) > -1)
    {
        let match = null;

        while((match = /@[a-zA-Z]+@/g.exec(content)) !== null)
        {
            const colorTag = match[0].toString();
            const colorName = colorTag.substr(1, colorTag.length - 2);
            const text = content.replace(colorTag, '');

            if(!allowedColours.has(colorName))
            {
                result = text;
            }
            else
            {
                const color = allowedColours.get(colorName);
                result = '<span style="color: ' + color + '">' + text + '</span>';
            }
            break;
        }
    }
    else
    {
        result = content;
    }

    return result;
}
