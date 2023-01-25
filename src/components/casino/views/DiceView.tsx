import { FC } from 'react';

export const DiceView: FC<{}> = props =>
{

    return (
        <>
            <div className="alert alert-primary text-center"><b>Selecciona un número del 1 al 6. Si el dado saca el mismo número, ganas x2.</b></div>
            <b style={{color: "var(--test-galaxytext)"}}>Selecciona un número entre 1 y 6</b>
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
