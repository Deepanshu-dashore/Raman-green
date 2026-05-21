/** Mongo filter: document is not soft-deleted */
export const notDeletedFilter = { isDeleted: { $ne: true } };

/** Populate config for variants — excludes soft-deleted variants */
export const variantPopulate = {
    path: "variants",
    match: notDeletedFilter,
    populate: [
        { path: "unit" },
        { path: "packaging" }
    ]
};
