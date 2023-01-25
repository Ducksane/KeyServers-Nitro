import { FixedSizeStack, NitroPoint, NitroRectangle, RoomObjectType } from '@nitrots/nitro-renderer';
import { CSSProperties, FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GetNitroInstance, GetRoomObjectBounds, GetRoomObjectScreenLocation, GetRoomSession, GetTicker } from '../../../../api';
import { Base, BaseProps } from '../../../../common';
import { ContextMenuCaretView } from './ContextMenuCaretView';

interface ContextMenuViewProps extends BaseProps<HTMLDivElement>
{
    objectId: number;
    category: number;
    userType?: number;
    fades?: boolean;
    close: () => void;
    collapsable?: boolean;
}

const LOCATION_STACK_SIZE: number = 25;
const BUBBLE_DROP_SPEED: number = 3;
const fadeDelay = 3000;
const fadeLength = 75;
const SPACE_AROUND_EDGES = 10;

let COLLAPSED = false;

export const ContextMenuView: FC<ContextMenuViewProps> = props =>
{
    const { objectId = -1, category = -1, userType = -1, fades = false, close = null, position = 'absolute', classNames = [], style = {}, children = null, collapsable = false, ...rest } = props;
    const [ pos, setPos ] = useState<{ x: number, y: number }>({ x: null, y: null });
    const [ deltaYStack, setDeltaYStack ] = useState<FixedSizeStack>(null);
    const [ currentDeltaY, setCurrentDeltaY ] = useState(-1000000);
    const [ opacity, setOpacity ] = useState(1);
    const [ isFading, setIsFading ] = useState(false);
    const [ fadeTime, setFadeTime ] = useState(0);
    const [ isFrozen, setIsFrozen ] = useState(false);
    const elementRef = useRef<HTMLDivElement>();

    const [ collapsed, setCollapsed ] = useState(COLLAPSED);

    const getOffset = useCallback((bounds: NitroRectangle) =>
    {
        let height = -(elementRef.current.offsetHeight);

        if((userType > -1) && ((userType === RoomObjectType.USER) || (userType === RoomObjectType.BOT) || (userType === RoomObjectType.RENTABLE_BOT)))
        {
            height = (height + ((bounds.height > 50) ? 15 : 0));
        }
        else
        {
            height = (height - 14);
        }

        return height;
    }, [ userType ]);

    const updateFade = useCallback((time: number) =>
    {
        let newFadeTime = time;
        let newOpacity = 1;

        if(isFading)
        {
            setFadeTime(prevValue =>
            {
                newFadeTime += prevValue;

                return newFadeTime;
            });

            newOpacity = ((1 - (newFadeTime / fadeLength)) * 1);

            if(newOpacity <= 0)
            {
                close();

                return false;
            }

            setOpacity(newOpacity);
        }

        return true;
    }, [ isFading, close ]);

    const updatePosition = useCallback((bounds: NitroRectangle, location: NitroPoint) =>
    {
        if(!bounds || !location || !deltaYStack) return;

        const offset = getOffset(bounds);

        deltaYStack.addValue((location.y - bounds.top));

        let maxStack = deltaYStack.getMax();

        if(maxStack < (currentDeltaY - BUBBLE_DROP_SPEED)) maxStack = (currentDeltaY - BUBBLE_DROP_SPEED);
        
        const deltaY = (location.y - maxStack);

        let x = ~~(location.x - (elementRef.current.offsetWidth / 2));
        let y = ~~(deltaY + offset);

        const maxLeft = ((GetNitroInstance().width - elementRef.current.offsetWidth) - SPACE_AROUND_EDGES);
        const maxTop = ((GetNitroInstance().height - elementRef.current.offsetHeight) - SPACE_AROUND_EDGES);

        if(x < SPACE_AROUND_EDGES) x = SPACE_AROUND_EDGES;
        else if(x > maxLeft) x = maxLeft;

        if(y < SPACE_AROUND_EDGES) y = SPACE_AROUND_EDGES;
        else if(y > maxTop) y = maxTop;

        setCurrentDeltaY(maxStack);
        setPos({ x, y });
    }, [ deltaYStack, currentDeltaY, getOffset ]);

    const update = useCallback((time: number) =>
    {
        if(!elementRef.current || !updateFade(time)) return;

        const bounds = GetRoomObjectBounds(GetRoomSession().roomId, objectId, category);
        const location = GetRoomObjectScreenLocation(GetRoomSession().roomId, objectId, category);

        updatePosition(bounds, location);
    }, [ objectId, category, updateFade, updatePosition ]);

    const getClassNames = useMemo(() =>
    {
        const newClassNames: string[] = [ 'nitro-context-menu animate__animated animate__pulse animate__slow animate__infinite' ];
        
        if (collapsed) newClassNames.push('menu-hidden');

        newClassNames.push((pos.x !== null) ? 'visible' : 'invisible');

        if(classNames.length) newClassNames.push(...classNames);

        return newClassNames;
    }, [ pos, classNames, collapsed ]);

    const getStyle = useMemo(() =>
    {
        let newStyle: CSSProperties = {};

        newStyle.left = (pos.x || 0);
        newStyle.top = (pos.y || 0);
        newStyle.opacity = opacity;

        if(Object.keys(style).length) newStyle = { ...newStyle, ...style };

        return newStyle;
    }, [ pos, opacity, style ]);

    useEffect(() =>
    {
        setDeltaYStack(new FixedSizeStack(LOCATION_STACK_SIZE));
        setCurrentDeltaY(-1000000);
    }, []);

    useEffect(() =>
    {
        let added = false;

        if(!isFrozen)
        {
            added = true;

            GetTicker().add(update);
        }

        return () =>
        {
            if(added) GetTicker().remove(update);
        }
    }, [ isFrozen, update ]);

    useEffect(() =>
    {
        if(!fades) return;

        const timeout = setTimeout(() => setIsFading(true), fadeDelay);

        return () => clearTimeout(timeout);
    }, [ fades ]);
    

    const toggleCollapse = () =>
    {
        COLLAPSED = !COLLAPSED;
        setCollapsed(COLLAPSED)
    }
    return <Base innerRef={ elementRef } position={ position } classNames={ getClassNames } style={ getStyle } onMouseOver={ event => setIsFrozen(true) } onMouseOut={ event => setIsFrozen(false) } { ...rest }>
        { !(collapsable && COLLAPSED) && children }
        { collapsable && <ContextMenuCaretView onClick={ () => toggleCollapse() } collapsed={ collapsed } /> }
    </Base>;
}
