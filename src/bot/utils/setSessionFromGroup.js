module.exports = (group, session) => {
  session.groupId = group.group_id
  session.group = group.group_full_name
}
