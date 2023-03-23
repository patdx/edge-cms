import { SqliteTableSchema } from 'src/db/migrator/types';
import type { z } from 'zod';

export default function NewSchema() {
  const chats: z.input<typeof SqliteTableSchema> = {
    name: 'chats',
    columns: [
      {
        name: 'id',
        type: 'TEXT',
      },
      {
        name: 'title',
        type: 'TEXT',
      },
      {
        name: 'users',
        type: {
          type: 'array',
          item: 'TEXT',
        },
      },
    ],
  };

  const tables = [SqliteTableSchema.parse(chats)];

  for (const table of tables) {
    const deleteMe = new Set();
    for (const column of table.columns) {
      if (typeof column.type === 'string') {
        // do nothing
      } else if (column.type.type === 'array') {
        const newTable: z.input<typeof SqliteTableSchema> = {
          name: `${table.name}_${column.name}`,
          columns: [
            {
              name: 'id',
              type: 'TEXT',
            },
            {
              name: `${table.name}_id`,
              type: 'TEXT',
            },
            // insert other fields
            {
              name: column.name,
              type: column.type.item,
            },
          ],
        };

        tables.push(SqliteTableSchema.parse(newTable));

        deleteMe.add(column);
      }
    }

    table.columns = table.columns.filter((col) => !deleteMe.has(col));
  }

  return (
    <>
      <div>test</div>
      {tables.map((table) => (
        <pre>{JSON.stringify(table, undefined, 2)}</pre>
      ))}
    </>
  );
}
