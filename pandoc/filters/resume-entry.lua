local function has_class(classes, name)
  for _, class in ipairs(classes) do
    if class == name then
      return true
    end
  end
  return false
end

local function is_markdown_output()
  return FORMAT == 'gfm' or FORMAT == 'markdown' or FORMAT:match('markdown') ~= nil
end

local function markdown_escape(value)
  local escaped = tostring(value)
    :gsub('\\', '\\\\')
    :gsub('([`*_{}%[%]#])', '\\%1')

  return escaped
end

local function markdown_link(entry)
  local label = tostring(entry.label)
  local href = entry.href and tostring(entry.href) or nil

  if href and href == 'mailto:' .. label then
    return '<' .. label .. '>'
  end

  if href then
    return '[' .. markdown_escape(label) .. '](' .. href .. ')'
  end

  return markdown_escape(label)
end

local skill_item_marker = 'resume-skill-item:'

local function cell_content(value)
  if type(value) == 'table' then
    return value
  end

  return { pandoc.Str(tostring(value)) }
end

local function has_value(value)
  return value ~= nil and tostring(value) ~= ''
end

local function emphasized(value)
  return { pandoc.Emph(cell_content(value)) }
end

local function resume_row(left, right, classes)
  local inlines = {}

  if has_value(left) then
    table.insert(inlines, pandoc.Span(cell_content(left)))
  elseif has_value(right) then
    table.insert(inlines, pandoc.Span({}))
  end

  if has_value(right) then
    table.insert(inlines, pandoc.Space())
    table.insert(inlines, pandoc.Span(cell_content(right)))
  end

  return pandoc.Div({ pandoc.Plain(inlines) }, pandoc.Attr('', classes))
end

local resume_entry_fields = {
  title = true,
  dates = true,
  company = true,
  link = true,
  location = true,
}

local skill_entry_fields = {
  category = true,
  skills = true,
}

local contact_list_fields = {
  entries = true,
}

local resume_footer_fields = {
  date = true,
  url = true,
}

local contact_entry_fields = {
  label = true,
  href = true,
}

local function validate_fields(entry, allowed_fields, entry_type)
  for key, _ in pairs(entry) do
    if not allowed_fields[key] then
      error('Unsupported ' .. entry_type .. ' JSON field: ' .. tostring(key))
    end
  end
end

local function decode_entry(block, entry_type)
  local ok, entry = pcall(pandoc.json.decode, block.text)
  if not ok or type(entry) ~= 'table' then
    error('Invalid JSON in ' .. entry_type .. ' block: ' .. tostring(entry))
  end

  return entry
end

local function resume_entry(block)
  local entry = decode_entry(block, 'resume-entry')

  validate_fields(entry, resume_entry_fields, 'resume-entry')

  if not entry.title then
    error('resume-entry JSON requires title')
  end

  if is_markdown_output() then
    local lines = {
      '### ' .. markdown_escape(entry.title),
      '',
    }

    if has_value(entry.company) then
      table.insert(lines, '- *' .. markdown_escape(entry.company) .. '*')
    end

    if has_value(entry.link) then
      local link = tostring(entry.link)
      table.insert(lines, '- [' .. markdown_escape(link) .. '](' .. link .. ')')
    end

    if has_value(entry.dates) then
      table.insert(lines, '- *' .. markdown_escape(entry.dates) .. '*')
    end

    if has_value(entry.location) then
      table.insert(lines, '- *' .. markdown_escape(entry.location) .. '*')
    end

    return pandoc.RawBlock('markdown', table.concat(lines, '\n'))
  end

  local rows = {
    resume_row(entry.title, entry.dates, { 'resume-row', 'resume-title-row' }),
  }

  if has_value(entry.company) or has_value(entry.link) or has_value(entry.location) then
    local left = nil

    if has_value(entry.company) and has_value(entry.link) then
      local link = tostring(entry.link)
      left = {
        pandoc.Emph(cell_content(entry.company)),
        pandoc.LineBreak(),
        pandoc.Link({ pandoc.Str(link) }, link),
      }
    elseif has_value(entry.company) then
      left = emphasized(entry.company)
    elseif has_value(entry.link) then
      local link = tostring(entry.link)
      left = { pandoc.Link({ pandoc.Str(link) }, link) }
    end

    table.insert(rows, resume_row(
      left,
      has_value(entry.location) and emphasized(entry.location) or nil,
      { 'resume-row' }
    ))
  end

  return pandoc.Div(rows, pandoc.Attr('', { 'resume-entry' }))
end

local function skill_entry(block)
  local entry = decode_entry(block, 'skill-entry')

  validate_fields(entry, skill_entry_fields, 'skill-entry')

  if not entry.category or type(entry.skills) ~= 'table' or #entry.skills == 0 then
    error('skill-entry JSON requires category and skills')
  end

  local skills = {}
  for _, skill in ipairs(entry.skills) do
    table.insert(skills, tostring(skill))
  end

  if is_markdown_output() then
    local escaped_skills = {}
    for _, skill in ipairs(skills) do
      table.insert(escaped_skills, markdown_escape(skill))
    end

    return pandoc.RawBlock('markdown', skill_item_marker .. '- **' .. markdown_escape(entry.category) .. '**: ' .. table.concat(escaped_skills, ', '))
  end

  return pandoc.BulletList({
    {
      pandoc.Plain({
        pandoc.Strong({ pandoc.Str(tostring(entry.category)) }),
        pandoc.Str(': ' .. table.concat(skills, ', ')),
      })
    }
  })
end

local function contact_item(entry)
  validate_fields(entry, contact_entry_fields, 'contact-list entry')

  if not entry.label then
    error('contact-list entries require label')
  end

  if entry.href then
    return pandoc.Link({ pandoc.Str(tostring(entry.label)) }, tostring(entry.href))
  end

  return pandoc.Str(tostring(entry.label))
end

local function contact_list(block)
  local entry = decode_entry(block, 'contact-list')

  validate_fields(entry, contact_list_fields, 'contact-list')

  if type(entry.entries) ~= 'table' or #entry.entries == 0 then
    error('contact-list JSON requires entries')
  end

  if is_markdown_output() then
    local lines = {}

    for _, row in ipairs(entry.entries) do
      if type(row) ~= 'table' then
        error('contact-list entries must be lists of contact entry objects')
      end

      for _, item in ipairs(row) do
        if type(item) ~= 'table' then
          error('contact-list entries must be lists of contact entry objects')
        end

        validate_fields(item, contact_entry_fields, 'contact-list entry')
        if not item.label then
          error('contact-list entries require label')
        end

        table.insert(lines, markdown_link(item))
      end
    end

    if #lines == 0 then
      return {}
    end

    return pandoc.RawBlock('markdown', table.concat(lines, '\n'))
  end

  local lines = {}
  for _, row in ipairs(entry.entries) do
    if type(row) ~= 'table' then
      error('contact-list entries must be lists of contact entry objects')
    end

    local inlines = {}
    for _, item in ipairs(row) do
      if type(item) ~= 'table' then
        error('contact-list entries must be lists of contact entry objects')
      end

      local inline = contact_item(item)
      if inline then
        if #inlines > 0 then
          table.insert(inlines, pandoc.Space())
          table.insert(inlines, pandoc.Str('|'))
          table.insert(inlines, pandoc.Space())
        end

        table.insert(inlines, inline)
      end
    end

    if #inlines > 0 then
      table.insert(lines, inlines)
    end
  end

  if #lines == 0 then
    return {}
  end

  local inlines = {}
  for index, line in ipairs(lines) do
    if index > 1 then
      table.insert(inlines, pandoc.LineBreak())
    end

    for _, inline in ipairs(line) do
      table.insert(inlines, inline)
    end
  end

  return pandoc.Para(inlines)
end

local function resume_footer(block)
  local entry = decode_entry(block, 'resume-footer')

  validate_fields(entry, resume_footer_fields, 'resume-footer')

  if not entry.date or not entry.url then
    error('resume-footer JSON requires date and url')
  end

  if is_markdown_output() then
    return {
      pandoc.HorizontalRule(),
      pandoc.Plain({
        pandoc.Strong({ pandoc.Str('Last updated:') }),
        pandoc.Space(),
        pandoc.Str(tostring(entry.date)),
      }),
      pandoc.Plain({
        pandoc.Strong({ pandoc.Str('Latest version:') }),
        pandoc.Space(),
        pandoc.Link({ pandoc.Str(tostring(entry.url)) }, tostring(entry.url)),
      }),
    }
  end

  return pandoc.Div({
    pandoc.Plain({
      pandoc.Span({ pandoc.Str(tostring(entry.date)) }),
      pandoc.Span({ pandoc.Str(tostring(entry.url)) }),
    }),
  }, pandoc.Attr('', { 'resume-footer' }))
end

local function tag_line(block)
  local text = tostring(block.text):gsub('^%s+', ''):gsub('%s+$', '')

  if text == '' then
    error('tag-line block requires text')
  end

  if is_markdown_output() then
    return pandoc.RawBlock('markdown', markdown_escape(text))
  end

  return pandoc.Div({
    pandoc.Plain({ pandoc.Str(text) }),
  }, pandoc.Attr('', { 'tag-line' }))
end

function CodeBlock(block)
  if has_class(block.classes, 'contact-list') then
    return contact_list(block)
  end

  if has_class(block.classes, 'tag-line') then
    return tag_line(block)
  end

  if has_class(block.classes, 'resume-entry') then
    return resume_entry(block)
  end

  if has_class(block.classes, 'skill-entry') then
    return skill_entry(block)
  end

  if has_class(block.classes, 'resume-footer') then
    return resume_footer(block)
  end

  return nil
end

function RawBlock(block)
  if is_markdown_output() and block.format == 'html' and block.text:match('^%s*<!%-%-') then
    return {}
  end

  return nil
end

function RawInline(inline)
  if is_markdown_output() and inline.format == 'html' and inline.text:match('^%s*<!%-%-') then
    return {}
  end

  return nil
end

function Pandoc(doc)
  if not is_markdown_output() then
    return nil
  end

  local blocks = {}
  local skill_items = {}

  local function flush_skill_items()
    if #skill_items > 0 then
      table.insert(blocks, pandoc.RawBlock('markdown', table.concat(skill_items, '\n')))
      skill_items = {}
    end
  end

  for _, block in ipairs(doc.blocks) do
    if block.t == 'RawBlock' and block.format == 'markdown' and block.text:sub(1, #skill_item_marker) == skill_item_marker then
      table.insert(skill_items, block.text:sub(#skill_item_marker + 1))
    else
      flush_skill_items()
      table.insert(blocks, block)
    end
  end

  flush_skill_items()
  doc.blocks = blocks
  return doc
end
