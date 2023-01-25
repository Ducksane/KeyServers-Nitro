import { FC } from 'react';


export const RouletteFloorView: FC<{}> = props =>
{

    return (
        <>
            <div className="alert alert-primary text-center"><b>Selecciona un número. Si el número es par y toca par, ganarás un x1.5. Si toca el mismo número, ganarás un x5. Si seleccionas 0 y sale 0 ganarás un x10.</b></div>
            <b style={{color: "var(--test-galaxytext)"}}>Selecciona un número entre 0 y 32</b>
            <input className="form-control" type="number" placeholder="0" />
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
