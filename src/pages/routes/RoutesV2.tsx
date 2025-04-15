import React from 'react';
import { Route } from './models/Route'; // Asegúrate de importar el modelo Route
import BaseLayoutV2 from '../../PagesV2/BaseLayoutV2';

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


