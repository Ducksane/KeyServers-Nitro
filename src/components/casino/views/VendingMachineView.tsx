import { FC } from 'react';

export const VendingMachineView: FC<{}> = props =>
{

    return (
        <div>
            <div className="alert alert-primary text-center"><b>Si la tragaperras te da premio, ganas x2.</b></div>
            <b style={{color: "var(--test-galaxytext)"}}>Moneda a apostar:</b>
            <select className="form-control">
                <option>Créditos</option>
                <option>Cometas</option>
                <option>Estrellas</option>
            </select>
            <b style={{color: "var(--test-galaxytext)"}}>Cantidad a apostar:</b>
            <input className="form-control" type="number" placeholder="0" />
            <br/>
            <button className="btn btn-success w-100">Apostar</button>
        </div>
    );
}
