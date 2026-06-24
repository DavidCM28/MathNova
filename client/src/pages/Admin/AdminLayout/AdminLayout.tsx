import { type ReactNode, useEffect, useRef, useState } from "react";
import AdminIcons from "../components/AdminIcons";
import AdminSidebar from "../components/AdminSidebar";
import AdminTopbar from "../components/AdminTopbar";
import "./AdminLayout.css";

export type AdminPage = "dashboard" | "groups" | "activities" | "resources" | "reports" | "requests" | "settings";

type AdminLayoutProps = {
  activePage: AdminPage;
  children: ReactNode;
  shellClassName?: string;
};

const buttonMessages: Record<string, string> = {
  createUser: "Formulario para crear usuario abierto",
  generateReport: "Preparando el reporte administrativo",
  createGroup: "Formulario para crear grupo abierto",
  assignTeacher: "Selecciona un grupo para asignar docente",
  createActivity: "Formulario para crear actividad abierto",
  scheduleEvaluation: "Calendario de evaluaciones abierto",
  uploadResource: "Selector para subir recurso abierto",
  createCollection: "Formulario para crear colección abierto",
  exportPdf: "Preparando reporte en PDF",
  downloadData: "Descargando datos del periodo",
  assignTicket: "Selector para asignar ticket abierto",
  exportIncidents: "Exportando incidencias del periodo",
  saveSettings: "Configuración guardada correctamente",
  createRoleTop: "Formulario para crear rol abierto",
  createRoleInline: "Formulario para crear rol abierto"
};

function normalize(value: string) {
  return value.trim().toLocaleLowerCase("es");
}

function setEmptyState(root: HTMLElement, selector: string, visible: boolean) {
  root.querySelector(selector)?.classList.toggle("visible", visible);
}

function AdminLayout({ activePage, children, shellClassName = "" }: AdminLayoutProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const toastTimerRef = useRef<number>(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (message?: string | null) => {
    if (!message) return;
    setToast(message);
    window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(""), 2600);
  };

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let activeActivityType = "";
    let activeSupportType = "";

    const getSelectValue = (selector: string) => root.querySelector<HTMLSelectElement>(selector)?.value ?? "";

    const filterGroups = () => {
      const query = normalize(root.querySelector<HTMLInputElement>("#groupSearch")?.value ?? "");
      const level = getSelectValue("#levelFilter");
      const shift = getSelectValue("#shiftFilter");
      const status = getSelectValue("#statusFilter");
      let visibleRows = 0;

      root.querySelectorAll<HTMLTableRowElement>("#groupsTableBody tr").forEach((row) => {
        const visible = (!query || normalize(row.textContent ?? "").includes(query)) && (!level || row.dataset.level === level) && (!shift || row.dataset.shift === shift) && (!status || row.dataset.status === status);
        row.hidden = !visible;
        if (visible) visibleRows += 1;
      });

      setEmptyState(root, "#emptyTable", visibleRows === 0);
    };

    const filterActivities = () => {
      const subject = getSelectValue("#subjectFilter");
      const group = getSelectValue("#activityGroupFilter");
      const status = getSelectValue("#activityStatusFilter");
      let visibleRows = 0;

      root.querySelectorAll<HTMLTableRowElement>("#activitiesTableBody tr").forEach((row) => {
        const visible = (!activeActivityType || row.dataset.type === activeActivityType) && (!subject || row.dataset.subject === subject) && (!group || row.dataset.group === group) && (!status || row.dataset.status === status);
        row.hidden = !visible;
        if (visible) visibleRows += 1;
      });

      setEmptyState(root, "#emptyActivities", visibleRows === 0);
      const resultLabel = root.querySelector("#activityResults");
      if (resultLabel) resultLabel.textContent = visibleRows ? `Mostrando 1 a ${visibleRows} de ${visibleRows} resultados` : "Sin resultados";
    };

    const filterResources = () => {
      const query = normalize(root.querySelector<HTMLInputElement>("#resourceSearch")?.value ?? "");
      const subject = getSelectValue("#resourceSubject");
      const level = getSelectValue("#resourceLevel");
      const format = getSelectValue("#resourceFormat");
      const status = getSelectValue("#resourceStatus");
      let visibleRows = 0;

      root.querySelectorAll<HTMLTableRowElement>("#resourcesTableBody tr").forEach((row) => {
        const visible = (!query || normalize(row.textContent ?? "").includes(query)) && (!subject || row.dataset.subject === subject) && (!level || row.dataset.level === level) && (!format || row.dataset.format === format) && (!status || row.dataset.status === status);
        row.hidden = !visible;
        if (visible) visibleRows += 1;
      });

      setEmptyState(root, "#emptyResources", visibleRows === 0);
      const resultLabel = root.querySelector("#resourceResults");
      if (resultLabel) resultLabel.textContent = visibleRows ? `Mostrando 1 a ${visibleRows} de 532 recursos` : "Sin resultados";
    };

    const filterRequests = () => {
      const query = normalize(root.querySelector<HTMLInputElement>("#requestSearch")?.value ?? "");
      const type = getSelectValue("#requestType");
      const priority = getSelectValue("#requestPriority");
      const status = getSelectValue("#requestStatus");
      let visibleRows = 0;

      root.querySelectorAll<HTMLTableRowElement>("#requestsTableBody tr").forEach((row) => {
        const visible = (!activeSupportType || row.dataset.type === activeSupportType) && (!query || normalize(row.textContent ?? "").includes(query)) && (!type || row.dataset.type === type) && (!priority || row.dataset.priority === priority) && (!status || row.dataset.status === status);
        row.hidden = !visible;
        if (visible) visibleRows += 1;
      });

      setEmptyState(root, "#emptyRequests", visibleRows === 0);
      const resultLabel = root.querySelector("#requestResults");
      if (resultLabel) resultLabel.textContent = visibleRows ? `Mostrando 1 a ${visibleRows} de 45 solicitudes` : "Sin resultados";
    };

    const handleClick = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const sectionToggle = target.closest<HTMLButtonElement>(".section-toggle");
      if (sectionToggle) {
        event.preventDefault();
        const section = sectionToggle.closest(".nav-section");
        const isOpen = section?.classList.toggle("open") ?? false;
        sectionToggle.setAttribute("aria-expanded", String(isOpen));
        return;
      }

      const activityTab = target.closest<HTMLElement>("[data-activity-tab]");
      if (activityTab) {
        event.preventDefault();
        root.querySelectorAll("[data-activity-tab]").forEach((tab) => tab.classList.remove("active"));
        activityTab.classList.add("active");
        activeActivityType = activityTab.dataset.activityTab ?? "";
        filterActivities();
        return;
      }

      const resetActivityFilters = target.closest("#resetActivityFilters");
      if (resetActivityFilters) {
        event.preventDefault();
        ["#subjectFilter", "#activityGroupFilter", "#activityStatusFilter"].forEach((selector) => {
          const filter = root.querySelector<HTMLSelectElement>(selector);
          if (filter) filter.value = "";
        });
        activeActivityType = "";
        root.querySelectorAll("[data-activity-tab]").forEach((tab, index) => tab.classList.toggle("active", index === 0));
        filterActivities();
        showToast("Filtros restablecidos");
        return;
      }

      const resetResourceFilters = target.closest("#resetResourceFilters");
      if (resetResourceFilters) {
        event.preventDefault();
        const search = root.querySelector<HTMLInputElement>("#resourceSearch");
        if (search) search.value = "";
        ["#resourceSubject", "#resourceLevel", "#resourceFormat", "#resourceStatus"].forEach((selector) => {
          const filter = root.querySelector<HTMLSelectElement>(selector);
          if (filter) filter.value = "";
        });
        filterResources();
        showToast("Filtros restablecidos");
        return;
      }

      const supportTab = target.closest<HTMLElement>("[data-support-tab]");
      if (supportTab) {
        event.preventDefault();
        root.querySelectorAll("[data-support-tab]").forEach((tab) => tab.classList.remove("active"));
        supportTab.classList.add("active");
        activeSupportType = supportTab.dataset.supportTab ?? "";
        filterRequests();
        return;
      }

      const settingsTab = target.closest<HTMLElement>("[data-settings-tab]");
      if (settingsTab) {
        event.preventDefault();
        root.querySelectorAll("[data-settings-tab]").forEach((tab) => tab.classList.remove("active"));
        settingsTab.classList.add("active");
        showToast(`Sección seleccionada: ${settingsTab.dataset.settingsTab}`);
        return;
      }

      const roleButton = target.closest<HTMLElement>("[data-role]");
      if (roleButton) {
        event.preventDefault();
        root.querySelectorAll("[data-role]").forEach((role) => role.classList.remove("active"));
        roleButton.classList.add("active");
        const selectedRole = root.querySelector("#selectedRole");
        if (selectedRole) selectedRole.textContent = roleButton.dataset.role ?? "";
        return;
      }

      const switchButton = target.closest<HTMLButtonElement>(".switch");
      if (switchButton) {
        event.preventDefault();
        const enabled = !switchButton.classList.contains("on");
        switchButton.classList.toggle("on", enabled);
        switchButton.setAttribute("aria-pressed", String(enabled));
        return;
      }

      const rowMenu = target.closest<HTMLButtonElement>(".row-menu");
      if (rowMenu) {
        event.preventDefault();
        showToast(rowMenu.getAttribute("aria-label"));
        return;
      }

      const button = target.closest<HTMLButtonElement>("button[id]");
      if (button?.id && buttonMessages[button.id]) {
        event.preventDefault();
        showToast(buttonMessages[button.id]);
        return;
      }

      const link = target.closest<HTMLAnchorElement>('a[href^="#"]');
      if (link) event.preventDefault();
    };

    const handleInput = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (target.closest("#groupSearch")) filterGroups();
      if (target.closest("#resourceSearch")) filterResources();
      if (target.closest("#requestSearch")) filterRequests();
    };

    const handleChange = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const id = target.id;
      if (["levelFilter", "shiftFilter", "statusFilter"].includes(id)) filterGroups();
      if (["subjectFilter", "activityGroupFilter", "activityStatusFilter"].includes(id)) filterActivities();
      if (["resourceSubject", "resourceLevel", "resourceFormat", "resourceStatus"].includes(id)) filterResources();
      if (["requestType", "requestPriority", "requestStatus"].includes(id)) filterRequests();
      if (["reportCampus", "reportLevel", "reportPeriod"].includes(id)) showToast(`Reporte actualizado: ${(target as HTMLSelectElement).value}`);
    };

    root.addEventListener("click", handleClick);
    root.addEventListener("input", handleInput);
    root.addEventListener("change", handleChange);

    return () => {
      root.removeEventListener("click", handleClick);
      root.removeEventListener("input", handleInput);
      root.removeEventListener("change", handleChange);
    };
  }, [activePage]);

  useEffect(() => {
    return () => window.clearTimeout(toastTimerRef.current);
  }, []);

  return (
    <div className="admin-root" ref={rootRef}>
      <AdminIcons />
      <div className={`app-shell ${shellClassName}`}>
        <AdminSidebar activePage={activePage} isOpen={sidebarOpen} />
        <div className="main-wrap">
          <AdminTopbar onMenuClick={() => setSidebarOpen(true)} />
          {children}
          <footer>© MathNova. &nbsp;Todos los derechos reservados.</footer>
        </div>
      </div>
      <div className={`toast ${toast ? "visible" : ""}`} role="status" aria-live="polite">{toast}</div>
      <button className={`sidebar-backdrop ${sidebarOpen ? "visible" : ""}`} id="sidebarBackdrop" type="button" aria-label="Cerrar menú" onClick={() => setSidebarOpen(false)}></button>
    </div>
  );
}

export default AdminLayout;
