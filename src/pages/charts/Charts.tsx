import { useLocation, useNavigate } from "react-router-dom";
import PageTitle from "../../components/PageTitle";
import Strings from "../../utils/localizations/Strings";
import AreasChart from "./components/AreasChart";
import CreatorsChart from "./components/CreatorsChart";
import WeeksChart from "./components/WeeksChart";
import PreclassifiersChart from "./components/PreclassifiersChart";
import { useEffect, useState } from "react";
import { useGetCardTypesCatalogsMutation } from '../../services/CardTypesService';
import { CardTypesCatalog } from "../../data/cardtypes/cardTypes";
import MethodologiesChart from "./components/MethodologiesChart";
import { Card, Empty } from "antd";
import { useGetMethodologiesChartDataMutation } from "../../services/chartService";
import { Methodology } from "../../data/charts/charts";
import { UnauthorizedRoute } from "../../utils/Routes";
import MachinesChart from "./components/MachinesChart";
import MechanicsChart from "./components/MechanicsChart";
import DefinitiveUsersChart from "./components/DefinitiveUsersChart";
import { UserRoles } from "../../utils/Extensions";

interface Props {
  rol: UserRoles;
}

const Charts = ({ rol }: Props) => {
  const location = useLocation();
  const [getMethodologiesCatalog] = useGetCardTypesCatalogsMutation();
  const [getMethodologies] = useGetMethodologiesChartDataMutation();
  const [methodologiesCatalog, setMethodologiesCatalog] = useState<
    CardTypesCatalog[]
  >([]);
  const [methodologies, setMethodologies] = useState<Methodology[]>([]);
  const navigate = useNavigate();

  const handleGetMethodologiesCatalog = async () => {
    if (!location.state) {
      navigate(UnauthorizedRoute);
      return;
    }
    const [response, response2] = await Promise.all([
      getMethodologiesCatalog().unwrap(),
      getMethodologies(location.state.siteId).unwrap(),
    ]);

    setMethodologiesCatalog(response);
    setMethodologies(response2);
  };

  useEffect(() => {
    handleGetMethodologiesCatalog();
  }, [location.state]);

  const siteName = location?.state?.siteName || Strings.empty;
  const siteId = location?.state?.siteId || Strings.empty;

  return (
    <>
      <div className="h-full flex flex-col">
        <div className="flex gap-2 justify-center flex-wrap items-center m-3">
          <PageTitle mainText={Strings.chartsOf} subText={siteName} />
        </div>
        <div className="flex-1 overflow-auto">
          {methodologies.length > 0 ? (
            <>
              <div className="mb-2 flex flex-wrap flex-row gap-2">
                <Card
                  title={
                    <div className="mt-2 flex flex-col items-center">
                      <h2 className="text-xl font-semibold text-black">
                        {Strings.anomalies}
                      </h2>
                    </div>
                  }
                  className="w-full mx-auto bg-gray-100 rounded-xl shadow-md"
                >
                  <div className="flex flex-col gap-2">
                    <div className="md:w-full justify-center flex flex-wrap gap-2 w-full">
                      {methodologies.map((m, index) => (
                        <div key={index} className="flex gap-1">
                          <div
                            className="w-5 rounded-lg border border-black"
                            style={{
                              background: `#${m.color}`,
                            }}
                          />
                          <h1 className="md:text-sm text-xs">
                            {m.methodology}
                          </h1>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <div className="md:flex-1 w-full h-60">
                        <PreclassifiersChart siteId={siteId} rol={rol} />
                      </div>
                      <div className="md:w-80 w-full h-60">
                        <MethodologiesChart
                          methodologies={methodologies}
                          methodologiesCatalog={methodologiesCatalog}
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
              <div className="mb-2 flex flex-wrap flex-row gap-2">
                <Card
                  title={
                    <div className="mt-2 flex flex-col items-center">
                      <h2 className="text-xl font-semibold text-black">
                        {Strings.areas}
                      </h2>
                    </div>
                  }
                  className="md:flex-1 w-full mx-auto bg-gray-100 rounded-xl shadow-md"
                >
                  <div className="w-full h-60">
                    <AreasChart
                      methodologies={methodologies}
                      siteId={siteId}
                      rol={rol}
                    />
                  </div>
                </Card>
                <Card
                  title={
                    <div className="mt-2 flex flex-col items-center">
                      <h2 className="text-xl font-semibold text-black">
                        {Strings.machines}
                      </h2>
                    </div>
                  }
                  className="md:flex-1 w-full mx-auto bg-gray-100 rounded-xl shadow-md"
                >
                  <div className="w-full h-60">
                    <MachinesChart
                      siteId={siteId}
                      methodologies={methodologies}
                      rol={rol}
                    />
                  </div>
                </Card>
              </div>
              <div className="mb-2 flex flex-wrap flex-row gap-2">
                <Card
                  title={
                    <div className="mt-2 flex flex-col items-center">
                      <h2 className="text-xl font-semibold text-black">
                        {Strings.creators}
                      </h2>
                    </div>
                  }
                  className="md:flex-1 w-full mx-auto bg-gray-100 rounded-xl shadow-md"
                >
                  <div className="w-full h-60">
                    <CreatorsChart
                      siteId={siteId}
                      methodologies={methodologies}
                      rol={rol}
                    />
                  </div>
                </Card>
                <Card
                  title={
                    <div className="mt-2 flex flex-col items-center">
                      <h2 className="text-xl font-semibold text-black">
                        {Strings.mechanics}
                      </h2>
                    </div>
                  }
                  className="md:flex-1 w-full mx-auto bg-gray-100 rounded-xl shadow-md"
                >
                  <div className="w-full h-60">
                    <MechanicsChart
                      rol={rol}
                      siteId={siteId}
                      methodologies={methodologies}
                    />
                  </div>
                </Card>
              </div>
              <div className="mb-2 flex flex-wrap flex-row gap-2">
                <Card
                  title={
                    <div className="mt-2 flex flex-col items-center">
                      <h2 className="text-xl font-semibold text-black">
                        {Strings.definitiveUsers}
                      </h2>
                    </div>
                  }
                  className="md:flex-1 w-full mx-auto bg-gray-100 rounded-xl shadow-md"
                >
                  <div className="w-full h-60">
                    <DefinitiveUsersChart
                      rol={rol}
                      siteId={siteId}
                      methodologies={methodologies}
                    />
                  </div>
                </Card>
                <Card
                  title={
                    <div className="mt-2 flex flex-col items-center">
                      <h2 className="text-xl font-semibold text-black">
                        {Strings.tagMonitoring}
                      </h2>
                    </div>
                  }
                  className="md:flex-1 w-full mx-auto bg-gray-100 rounded-xl shadow-md"
                >
                  <div className="w-full h-60">
                    <WeeksChart siteId={siteId} />
                  </div>
                </Card>
              </div>
            </>
          ) : (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
        </div>
      </div>
    </>
  );
};

export default Charts;
