import { PieChart } from '@mui/x-charts/PieChart';

export default function MyPie( data, title) {
   /** const data = [
        { id: 0, value: occupied, label: 'Occupied', color: '#dc2626' },
        { id: 1, value: available, label: 'Available', color: '#2563eb' },
        { id: 2, value: reserved, label: 'Reserved', color: '#f59e42' },
    ];  */
    return (
        <div className="card shadow-sm mb-3" style={{ minWidth: 220, background: '#fff', border: 'none', borderRadius: 12 }}>
            <div className="card-body">
                <h6 className="card-title mb-2 fw-semibold">{title}</h6>
                <PieChart
                    series={[{ data, innerRadius: 30, outerRadius: 80, paddingAngle: 2, cornerRadius: 4 }]}
                    width={200}
                    height={200}
                />
            </div>
        </div>
    );
}

