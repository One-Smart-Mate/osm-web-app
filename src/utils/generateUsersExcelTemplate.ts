import * as XLSX from 'xlsx';

/**
 * Generates and downloads an Excel template for user import
 * with the correct column names matching the backend expectations
 */
export const generateUsersExcelTemplate = () => {
  // Create sample data with correct column names
  // Backend accepts both "PhoneNumber" and "Celular"
  const data = [
    {
      Name: 'Juan Pérez',
      Email: 'juan@example.com',
      Role: 'operator',
      Celular: '527778123456'
    },
    {
      Name: 'Pedro González',
      Email: 'pedro@example.com',
      Role: 'operator',
      Celular: '527778234567'
    },
    {
      Name: 'Luis Martínez',
      Email: 'luis@example.com',
      Role: 'operator',
      Celular: '527778345678'
    },
    {
      Name: 'María García',
      Email: 'maria@example.com',
      Role: 'admin',
      Celular: '527778456789'
    },
    {
      Name: 'Ana López',
      Email: 'ana@example.com',
      Role: 'user',
      Celular: '527778567890'
    }
  ];

  // Create a new workbook
  const wb = XLSX.utils.book_new();

  // Convert data to worksheet
  const ws = XLSX.utils.json_to_sheet(data);

  // Set column widths for better readability
  ws['!cols'] = [
    { wch: 20 }, // Name
    { wch: 25 }, // Email
    { wch: 15 }, // Role
    { wch: 15 }, // Celular
  ];

  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Users');

  // Create roles information sheet
  const rolesData = [
    {
      Rol: 'mechanic',
      Descripción: 'Tiene acceso a la app.',
      Permisos: 'Pueden crear tarjetas. En la app, es a quien cualquier usuario le puede asignar la responsabilidad de resolver una tarjeta.'
    },
    {
      Rol: 'local_admin',
      Descripción: 'Tiene acceso a la app y a web.',
      Permisos: 'Pueden crear tarjetas. En la web tiene acceso a administrar tarjetas (asignar tarjetas a cualquier usuario, modificar prioridades) y revisar las gráficas.'
    },
    {
      Rol: 'local_sis_admin',
      Descripción: 'Tiene acceso a la app y web.',
      Permisos: 'Pueden crear tarjetas. Son los encargados de dar de alta los catálogos del sistema: Usuarios, Tipos de tarjetas, Preclasificadores, Prioridades, Niveles.'
    },
    {
      Rol: 'operator',
      Descripción: 'Tiene acceso a la app.',
      Permisos: 'Pueden crear tarjetas. Son los usuarios generales del sistema, pueden asignar tarjetas a los mecánicos.'
    },
    {
      Rol: 'external_provider',
      Descripción: 'Son usuarios externos del sistema.',
      Permisos: 'Se les pueden asignar tarjetas y les son visibles solo mientras la tarjeta no esté resuelta; solo pueden ver sus tarjetas asignadas, el aviso les llega por correo electrónico.'
    }
  ];

  // Convert roles data to worksheet
  const rolesWs = XLSX.utils.json_to_sheet(rolesData);

  // Set column widths for roles sheet
  rolesWs['!cols'] = [
    { wch: 20 }, // Rol
    { wch: 30 }, // Descripción
    { wch: 80 }, // Permisos
  ];

  // Add the roles worksheet to the workbook
  XLSX.utils.book_append_sheet(wb, rolesWs, 'Información de Roles');

  // Generate Excel file and trigger download
  XLSX.writeFile(wb, 'users_import_template.xlsx');
};

/**
 * Alternative function that includes the Translation column
 * for language preference
 */
export const generateUsersExcelTemplateWithTranslation = () => {
  const data = [
    {
      Name: 'Juan Pérez',
      Email: 'juan@example.com',
      Role: 'operator',
      Celular: '527778123456',
      Translation: 'ES'
    },
    {
      Name: 'Pedro González',
      Email: 'pedro@example.com',
      Role: 'operator',
      Celular: '527778234567',
      Translation: 'ES'
    },
    {
      Name: 'John Smith',
      Email: 'john@example.com',
      Role: 'admin',
      Celular: '527778345678',
      Translation: 'EN'
    }
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);

  ws['!cols'] = [
    { wch: 20 }, // Name
    { wch: 25 }, // Email
    { wch: 15 }, // Role
    { wch: 15 }, // Celular
    { wch: 12 }, // Translation
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Users');

  // Create roles information sheet (same as in main function)
  const rolesData = [
    {
      Rol: 'mechanic',
      Descripción: 'Tiene acceso a la app.',
      Permisos: 'Pueden crear tarjetas. En la app, es a quien cualquier usuario le puede asignar la responsabilidad de resolver una tarjeta.'
    },
    {
      Rol: 'local_admin',
      Descripción: 'Tiene acceso a la app y a web.',
      Permisos: 'Pueden crear tarjetas. En la web tiene acceso a administrar tarjetas (asignar tarjetas a cualquier usuario, modificar prioridades) y revisar las gráficas.'
    },
    {
      Rol: 'local_sis_admin',
      Descripción: 'Tiene acceso a la app y web.',
      Permisos: 'Pueden crear tarjetas. Son los encargados de dar de alta los catálogos del sistema: Usuarios, Tipos de tarjetas, Preclasificadores, Prioridades, Niveles.'
    },
    {
      Rol: 'operator',
      Descripción: 'Tiene acceso a la app.',
      Permisos: 'Pueden crear tarjetas. Son los usuarios generales del sistema, pueden asignar tarjetas a los mecánicos.'
    },
    {
      Rol: 'external_provider',
      Descripción: 'Son usuarios externos del sistema.',
      Permisos: 'Se les pueden asignar tarjetas y les son visibles solo mientras la tarjeta no esté resuelta; solo pueden ver sus tarjetas asignadas, el aviso les llega por correo electrónico.'
    }
  ];

  // Convert roles data to worksheet
  const rolesWs = XLSX.utils.json_to_sheet(rolesData);

  // Set column widths for roles sheet
  rolesWs['!cols'] = [
    { wch: 20 }, // Rol
    { wch: 30 }, // Descripción
    { wch: 80 }, // Permisos
  ];

  // Add the roles worksheet to the workbook
  XLSX.utils.book_append_sheet(wb, rolesWs, 'Información de Roles');

  XLSX.writeFile(wb, 'users_import_template.xlsx');
};

/**
 * Information about the template columns
 */
export const templateInfo = {
  columns: [
    {
      name: 'Name',
      description: 'Nombre completo del usuario',
      required: true,
      example: 'Juan Pérez'
    },
    {
      name: 'Email',
      description: 'Correo electrónico del usuario',
      required: true,
      example: 'usuario@empresa.com'
    },
    {
      name: 'Role',
      description: 'Rol del usuario en el sistema',
      required: true,
      example: 'operator, admin, user'
    },
    {
      name: 'Celular',
      description: 'Número de celular (opcional)',
      required: false,
      example: '527778123456'
    },
    {
      name: 'Translation',
      description: 'Preferencia de idioma (EN/ES) - opcional',
      required: false,
      example: 'ES'
    }
  ],
  notes: [
    'Los campos Name, Email y Role son obligatorios',
    'El campo Celular es opcional pero recomendado para autenticación por WhatsApp',
    'El campo Translation define el idioma de las notificaciones (ES por defecto)',
    'El formato del celular debe incluir el código de país',
    'Los roles válidos son: operator, admin, user'
  ]
};