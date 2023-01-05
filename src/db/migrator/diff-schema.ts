import { escapeIdIfNeeded } from './shared';
import type {
  MigrationStep,
  MigrationStepCreateTable,
  SqliteColumnSchema,
  SqliteTableSchema,
} from './types';

export const diffSchema = (
  oldSchema: SqliteTableSchema[],
  newSchema: SqliteTableSchema[]
): MigrationStep[] => {
  const steps: MigrationStep[] = [];

  const oldTableNames = oldSchema.map((item) => item.name!);
  const newTableNames = newSchema.map((item) => item.name!);

  const added = newTableNames.filter(
    (newTableName) => !oldTableNames.includes(newTableName)
  );

  for (const add of added) {
    steps.push({
      type: 'create-table',
      table: newSchema.find((item) => item.name === add)!,
    });
  }

  const dropped = oldTableNames.filter(
    (oldTableName) => !newTableNames.includes(oldTableName)
  );

  for (const drop of dropped) {
    steps.push({
      type: 'drop-table',
      tableName: drop,
    });
  }

  for (const newTable of newSchema) {
    const oldTable = oldSchema.find((item) => item.name === newTable.name);

    if (oldTable) {
      const oldColumnNames = oldTable.columns.map((col) => col.name);
      const newColumnNames = newTable.columns.map((col) => col.name);

      const added = newColumnNames.filter(
        (newColumnName) => !oldColumnNames.includes(newColumnName)
      );

      for (const add of added) {
        steps.push({
          type: 'add-column',
          tableName: newTable.name!,
          column: newTable.columns.find((column) => column.name === add)!,
        });
      }

      const dropped = oldColumnNames.filter(
        (oldColumnName) => !newColumnNames.includes(oldColumnName)
      );

      for (const drop of dropped) {
        steps.push({
          type: 'drop-column',
          tableName: newTable.name!,
          columnName: drop,
        });
      }
    }
  }

  return steps;
};

export const generateMigrationStepCreateTable = (
  step: MigrationStepCreateTable
) => {
  const name = step.table.name;

  if (!name) throw new Error(`Name of table is required`);

  return [
    'CREATE TABLE',
    // if not exists may be used for specia features, for example
    // bootstrapping a migrations table
    ...(step.ifNotExists ? ['IF NOT EXISTS'] : []),
    escapeIdIfNeeded(name),
    `(${step.table.columns.map((column) => getColumnDef(column)).join(', ')})`,
    'STRICT;',
  ].join(' ');
};

export const generateMigrationStepSql = (step: MigrationStep): string => {
  if (step.type === 'create-table') {
    return generateMigrationStepCreateTable(step);
  } else if (step.type === 'drop-table') {
    return `DROP TABLE ${escapeIdIfNeeded(step.tableName)}`;
  } else if (step.type === 'add-column') {
    return `ALTER TABLE ${escapeIdIfNeeded(
      step.tableName
    )} ADD COLUMN ${getColumnDef(step.column)}`;
  } else if (step.type === 'drop-column') {
    return `ALTER TABLE ${escapeIdIfNeeded(step.tableName)} DROP COLUMN ${
      step.columnName
    }`;
  } else {
    throw new Error(`Unknown migration step type ${step}`);
  }
};

export const generateManyMigrationStepsSql = (
  steps: MigrationStep[]
): string[] => steps.map((step) => generateMigrationStepSql(step));

const getColumnDef = (column: SqliteColumnSchema) => {
  return [
    escapeIdIfNeeded(column.name),
    column.type,
    ...(column.pk === 1 ? ['PRIMARY KEY'] : []),
    ...(column.notnull ? ['NOT NULL'] : []),
  ].join(' ');
};
