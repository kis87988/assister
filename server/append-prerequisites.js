'use strict'

const request = require('./request.js')
const parsePrerequisites = function (string) {
  return string.replace(/[Ee]quivalent/g, '')
               .replace(/\s((or)|(OR))\s/g, '~')
               .replace(/~\s*$/g, ' ')
               .replace(/\s+/g, ' ')
               .trim()
               .split('~')
}
const appendPrerequisites = function (course, callback) {
  const url = 'http://www3.dvc.edu/org/info/course-outlines/'
  request(url + 'course-outline-results.htm?course=' + course.id.replace(/\s/, '+'), function ($) {
    $('a').each(function (i, link) {
      if ($(this).text().match(/See details\.\.\./)) {
        request(url + $(this).attr('href'), function ($) {
          $('font').each(function (j, row) {
            if ($(this).text().match(/Prerequisite/)) {
              course.prerequisites = parsePrerequisites($('font')[j + 1].children[0].data)
            }
            if ($(this).text().match(/Recommended/)) {
              course.recommended = parsePrerequisites($('font')[j + 1].children[0].data)
            }
            if ($(this).text().match(/Notes/)) {
              course.notes = $('font')[j + 1].children[0].data
            }
          })
          callback(course)
        })
      }
    })
  })
}
const recursiveCourseLoop = function (block, callback) {
  if (block.relation !== undefined) {
    let waiting = block.parts.length
    for (let i = 0; i < block.parts.length; i += 1) {
      recursiveCourseLoop(block.parts[i], function () {
        waiting -= 1
        if (!waiting) callback()
      })
    }
  } else if (block.course.relation !== undefined) {
    recursiveCourseLoop(block.course, callback)
  } else if (block.course.articulated === undefined) {
    appendPrerequisites(block.course, callback)
  } else callback()
}

module.exports = function (plan, callback) {
  let waiting = 0
  for (let key in plan) {
    waiting += plan[key].length
    for (let i = 0; i < plan[key].length; i++) {
      recursiveCourseLoop(plan[key][i], function () {
        waiting -= 1
        if (!waiting) callback(plan)
      })
    }
  }
}
