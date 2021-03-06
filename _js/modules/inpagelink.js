import {forEach} from 'lodash'
import domready from './domready'

export const classTrigger = 'js-inpagelink'

export default function() {
  return inPageLink()
}

export function inPageLink() {
  const nodeList = document.getElementsByClassName(classTrigger)
  forEach(nodeList, applyInPageLink)
  return nodeList
}

export function applyInPageLink(elTrigger) {
  const elId = elTrigger.getAttribute('href').replace('#', '')
  elTrigger.addEventListener('click', (e) => {
    e.preventDefault()
    focusOnInput(elId)
  })

  return { elTrigger, elId }
}

function focusOnInput(elId) {
  const container = document.getElementById(elId);
  console.log(container);
  container.scrollIntoView();

  const input = [
    ...container.getElementsByTagName('INPUT'),
    ...container.getElementsByTagName('TEXTAREA'),
    ...container.getElementsByTagName('SELECT'),
  ].filter(input => {
    const type = input.getAttribute('type');

    return type !== 'readonly' && type !== 'hidden' && type !== 'checkbox' && type !== 'radio';
  })[0];

  if (input) {
    input.focus();
  }
  return elId;
}

domready(inPageLink)
