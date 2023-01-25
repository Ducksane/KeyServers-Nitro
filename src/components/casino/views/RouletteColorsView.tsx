import { FC } from 'react';

export const RouletteColorsView: FC<{}> = props =>
{

    return (
        <>
            <div className="alert alert-primary text-center"><b>Selecciona un color. Si toca ese color, ganarás un x3 del dinero apostado.</b></div>
            <b style={{color: "var(--test-galaxytext)"}}>Selecciona un color:</b>
            <select className="form-control">
                <option>Rojo</option>
                <option>Naranja</option>
                <option>Amarillo</option>
                <option>Verde</option>
                <option>Morado</option>
            </select>
            <b style={{color: "var(--test-galaxytext)"}}>Moneda a apostar:</b>
            <select className="form-control">
                <option>Créditos</option>
                <option>Diamantes</option>
                <option>Duckets</option>
            </select>
            <b style={{color: "var(--test-galaxytext)"}}>Cantidad a apostar:</b>
            <input className="form-control" type="number" placeholder="0" />
            <br/>
            <button className="btn btn-success w-100">Apostar</button>
        </>
    );
}
