const createElement = ({type='div', id, className, attributes=[], text}) => {
    const $element = document.createElement(type);
    if (id) $element.setAttribute('id', id)
    if (className) $element.className = className
    if (text) $element.innerHTML = text
    Object.keys(attributes).forEach(key => $element.setAttribute(key, attributes[key]))
    return $element;
};

module.exports = {createElement};