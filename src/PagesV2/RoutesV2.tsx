import { Route } from '../pages/routes/models/Route'; // Asegúrate de importar el modelo Route
import BaseLayoutV2 from './Layout/BaseLayoutV2';

const dashboardTestRoute = new Route(
  "Dashboard Test",
  "dashboardTest",
  "/dashboard/test",
  <BaseLayoutV2/>,
  <></>
);

const routesV2: Route[] = [
  dashboardTestRoute,
];

export default routesV2;


