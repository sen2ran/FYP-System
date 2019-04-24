export default (value) => {
    const tmpDate = new Date(value);
    return tmpDate.toLocaleString('en-US')
}