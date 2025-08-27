export const getRelationType = (multiplicity) => {
    if (multiplicity[0] == '1' && multiplicity[1] == '1')
        return "One to One";
    if (multiplicity[0] == '1' && multiplicity[1] == '*')
        return "One to Many";
    if (multiplicity[0] == '*' && multiplicity[1] == '1')
        return "Many to One";
    if (multiplicity[0] == '*' && multiplicity[1] == '*')
        return "Many to Many";

};