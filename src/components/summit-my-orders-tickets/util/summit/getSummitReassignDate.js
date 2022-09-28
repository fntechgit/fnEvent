export const getSummitReassignDate = (summit) => {
    if (!summit) return null;

    return summit.end_date;
}
