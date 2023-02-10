import { navigate, useQueryClient, useServerSideMutation } from 'rakkasjs';
import sql, { raw } from 'sql-template-tag';
import { getOrm } from 'src/db/orm';

export const useDeleteMutation = () => {
  const queryClient = useQueryClient();

  const deleteMutation = useServerSideMutation<
    {
      entityName: string;
    },
    {
      entityName: string;
      id: string | number;
    }
  >(
    async (context, { entityName, id }) => {
      const query = sql`DELETE FROM ${raw(entityName)} WHERE id = ${id}`;

      console.log(query.sql, query.values);

      await getOrm(context)
        .DB.prepare(query.sql)
        .bind(...query.values)
        .run();

      return {
        entityName,
      };
    },
    {
      onSuccess({ entityName }) {
        queryClient.invalidateQueries(`view-all-${entityName}`);
        navigate(`/${entityName}`);
      },
    }
  );

  return deleteMutation;
};
