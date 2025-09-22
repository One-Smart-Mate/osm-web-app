/**
 * Generates and downloads a CSV template for user import
 */
export const generateUsersTemplate = () => {
  // Define the headers and sample data
  const headers = ['Name', 'Email', 'Role', 'PhoneNumber', 'Translation'];
  const sampleData = [
    ['John Doe', 'johndoe@example.com', 'User', '1234567890', 'EN'],
    ['Jane Smith', 'janesmith@example.com', 'Admin', '0987654321', 'ES'],
    ['User Example', 'user@company.com', 'User', '5555555555', 'ES']
  ];

  // Create CSV content
  let csvContent = headers.join(',') + '\n';
  sampleData.forEach(row => {
    csvContent += row.join(',') + '\n';
  });

  // Create a Blob from the CSV content
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  // Create a download link
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', 'users_import_template.csv');
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the URL object
  URL.revokeObjectURL(url);
};

/**
 * Information about the template columns
 */
export const templateInfo = {
  columns: [
    {
      name: 'Name',
      description: 'Full name of the user',
      required: true,
      example: 'John Doe'
    },
    {
      name: 'Email',
      description: 'Email address of the user',
      required: true,
      example: 'user@company.com'
    },
    {
      name: 'Role',
      description: 'User role in the system',
      required: true,
      example: 'User, Admin, etc.'
    },
    {
      name: 'PhoneNumber',
      description: 'Phone number (optional)',
      required: false,
      example: '1234567890'
    },
    {
      name: 'Translation',
      description: 'Language preference (EN/ES)',
      required: false,
      example: 'EN or ES'
    }
  ]
};