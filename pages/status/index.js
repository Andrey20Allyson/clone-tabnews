import useSWR from "swr";

async function fetchAPI(key) {
  const response = await fetch(key);
  const apiStatus = await response.json();

  return apiStatus;
}

export default function StatusPage() {
  return (
    <>
      <h1>Status</h1>
      <UpdatedAt />
      <ServicesStatus />
    </>
  );
}

function UpdatedAt() {
  const { data, isLoading } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  let updatedAtText = "Carregando...";

  if (isLoading === false) {
    updatedAtText = new Date(data.updated_at).toLocaleString("pt-br");
  }

  return <div>Ultima atualização: {updatedAtText}</div>;
}

const serviceStatusComponentMap = new Map([
  ["database", DatabaseServiceStatus],
]);

function ServicesStatus() {
  const { data, isLoading } = useSWR("/api/v1/status", fetchAPI);

  let servicesElement = "Carregando Serviços...";

  if (isLoading === false) {
    servicesElement = data.services.map((service, index) => {
      const StatusComponent = serviceStatusComponentMap.get(
        service.service_name,
      );

      return (
        <li key={index}>
          <StatusComponent service={service} />
        </li>
      );
    });
  }

  return <ul>{servicesElement}</ul>;
}

function DatabaseServiceStatus(props) {
  const { service } = props;

  const updatedAtText = new Date(
    service.service_status_updated_at,
  ).toLocaleString("pt-br");

  return (
    <>
      <h2>
        Banco de Dados
        <span style={{ color: "#0a0", margin: ".8rem" }}>Online</span>
      </h2>
      <p>SGBD: {service.database_management_system}</p>
      <p>versão: {service.database_version}</p>
      <p>Numero máximo de conexões: {service.database_max_connections}</p>
      <p>Numero de conexões ativas: {service.database_opened_connections}</p>
      <p>Ultima atualização do serviço {updatedAtText}</p>
    </>
  );
}
