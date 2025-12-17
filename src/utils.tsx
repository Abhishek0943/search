
export function formatSalaryRange(salaryStr: string) {
  const salaryRange = salaryStr.split('-');
  if (salaryRange.length !== 2) {
    return salaryStr;
  }
  const minSalary = parseInt(salaryRange[0]);
  const maxSalary = parseInt(salaryRange[1]);
  function formatSalary(salary: number) {
    if (salary >= 1000000) {
      let formatted = (salary / 1000000).toFixed(1) + 'M';
      return formatted.endsWith('.0M') ? formatted.slice(0, -3) + 'M' : formatted;
    } else if (salary >= 1000) {
      let formatted = (salary / 1000).toFixed(1) + 'K';
      return formatted.endsWith('.0K') ? formatted.slice(0, -3) + 'K' : formatted;
    } else {
      return salary.toString();
    }
  }
  const minSalaryFormatted = formatSalary(minSalary);
  const maxSalaryFormatted = formatSalary(maxSalary);
  return `${minSalaryFormatted}-${maxSalaryFormatted}`;
}