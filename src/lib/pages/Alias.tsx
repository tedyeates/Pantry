import Page from "../components/Page";
import type { ColumnDefinition } from "../components/Table";
import type { FirebaseAlias, FormFieldExtended, PantryAlias } from "../schemas/schema";

const OBJECT_TYPE = "alias"
function Alias() {
    const aliasColumns: ColumnDefinition<PantryAlias>[] = [
        { header: "Name", accessorKey: "name" },
        { header: "Alias", accessorFn: (row) => Object.keys(row.substitute).join(', ')},
        { header: "Substitute", accessorFn: (row) => Object.keys(row.alias).join(', ')},
        { header: "Created Date", accessorFn: (row) => row.createdDate.toLocaleDateString() },
    ];

    const aliasSubFields: FormFieldExtended[] = [
        {
            name: 'name',
            label: 'Name',
            type: 'text',
            placeholder: 'e.g., Brown Sugar',
            required: true
        },
    ]

    const fields: FormFieldExtended[] = [
        { name: 'name', label: 'Name', type: 'text', required: true, placeholder: 'e.g. Sugar' },
        { 
            name: 'alias', label: 'Alias', type: 'arrayOfObjects', 
            required: true, extraFields: aliasSubFields
        },
        { name: 'name', label: 'Name', type: 'text', required: true, placeholder: 'e.g. Sugar' },
    ]

    return (
        <Page<PantryAlias, FirebaseAlias>
            object_type={OBJECT_TYPE}
            columns={aliasColumns}
            createFields={fields}
            updateFields={fields}
        />
    )
}

export default Alias