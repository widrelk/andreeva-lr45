import logo from './logo.svg';
import './App.css';
import React, { useMemo, useState, useEffect } from 'react';

import { Row, Col } from 'react-simple-flex-grid';
import "react-simple-flex-grid/lib/main.css";

import { useTable } from 'react-table'

import { Paper, Select, MenuItem, TextField, Typography, FormControl, Divider, IconButton, Button, Modal } from '@mui/material';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'

import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import GridOnIcon from '@mui/icons-material/GridOn';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';

const TextFieldCell = ({
  value: initialValue,
  row: { index },
  column: { id },
  updateTableValue,
}) => {
  const [value, setValue] = useState(initialValue)

  const onChange = e => {
    setValue(e.target.value)
  }

  // We'll only update the external data when the input is blurred
  const onBlur = () => {
    updateTableValue(index, id, value);
  }

  // If the initialValue is changed external, sync it up with our state
  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  return <TextField value={value} onChange={onChange} onBlur={onBlur} size='small' />
}

const Table = ({ columns, data }) => {

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({
    columns,
    data,
  })
  return (
    <table {...getTableProps()} style={{ borderCollapse: 'collapse' }}>
      <thead>
        {headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => (
              <th {...column.getHeaderProps()} style={{ border: '1px solid black' }}>{column.render('Header')}</th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row, i) => {
          prepareRow(row)
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map(cell => {
                return <td {...cell.getCellProps()} style={{ border: '1px solid black' }}>{cell.render('Cell')}</td>
              })}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

const allTableware = [
  {
    id: '1',
    name: 'тарелочка',
    code: '12',
    price: 100.30,
  },
  {
    id: '2',
    name: 'ложечка',
    code: '41',
    price: 10,
  },
  {
    id: '3',
    name: 'вилочка',
    code: '30',
    price: 20,
  },
]

function App() {
  const [data, setData] = useState([{}]);
  const [genericData, setGenericData] = useState({subDiv: ''});
  const [comissionData, setComissionData] = useState({});
  const [comissionModalOpened, setComissionModalOpened] = useState(false);

  const [detailsData, setDetailsData] = useState('')
  const [detailsModalTarget, setDetailsModalTarget] = useState(-1);

  const updateTableValue = (index, id, value) => {
    const dataCopy = JSON.parse(JSON.stringify(data));
    dataCopy[index][id] = value;
    setData(dataCopy);
  }
  const updateValue = (id, value) => {
    const dataCopy = JSON.parse(JSON.stringify(genericData));
    dataCopy[id] = value;
    setGenericData(dataCopy);
  }

  const columns = useMemo(() => [
    {
      Header: 'Номер по порядку',
      accessor: 'index',
      Cell: ({ row }) => row.index + 1,
    },
    {
      Header: 'Посуда, приборы',
      columns: [
        {
          Header: 'Наименование',
          accessor: 'tableware.name',
          Cell: ({ row }) =>
            <Select
              size='small'
              style={{ width: '100%' }}
              value={row.original.tableware?.id || ''}
              onChange={(event) => {
                const dataCopy = JSON.parse(JSON.stringify(data));
                dataCopy[row.index].tableware = allTableware.find(elem => elem.id === event.target.value);
                if (!row.original.tableware) {
                  setData([...dataCopy, {}]);
                } else {
                  setData(dataCopy);
                }
              }}>
              {allTableware.map(elem => <MenuItem value={elem.id}>{elem.name}</MenuItem>)}
            </Select>
        },
        {
          Header: 'Код',
          accessor: 'tableware.code'
        },
      ],
    },
    {
      Header: 'Цена, руб. коп.',
      accessor: 'tableware.price',
    },
    {
      Header: 'Бой, лом',
      columns: [
        {
          Header: 'количество, шт.',
          accessor: 'destroyed',
          Cell: ({ cell, row, column }) => TextFieldCell({ value: cell.value, row, column, updateTableValue })
        },
        {
          Header: 'сумма, руб. коп.',
          accessor: 'destroyedLosses',
          Cell: ({ row }) => {
            const elem = data[row.index];
            return parseInt(elem.destroyed || 0) * parseFloat(elem.tableware?.price || 0)
          }
        },
      ],
    },
    {
      Header: 'Утрачено, пропало',
      columns: [
        {
          Header: 'количество, шт.',
          accessor: 'lost',
          Cell: ({ cell, row, column }) => TextFieldCell({ value: cell.value, row, column, updateTableValue })
        },
        {
          Header: 'сумма, руб. коп.',
          accessor: 'lostLosses',
          Cell: ({ row }) => {
            const elem = data[row.index];
            return parseInt(elem.lost || 0) * parseFloat(elem.tableware?.price || 0)
          }
        },
      ],
    },
    {
      Header: 'Всего',
      columns: [
        {
          Header: 'количество, шт.',
          accessor: 'total',
          Cell: ({ row }) => {
            const elem = data[row.index];
            return parseInt(elem.destroyed || 0) + parseFloat(elem.lost || 0)
          }
        },
        {
          Header: 'сумма, руб. коп.',
          accessor: 'totalLosses',
          Cell: ({ row }) => {
            const elem = data[row.index];
            return (parseInt(elem.destroyed || 0) + parseFloat(elem.lost || 0)) * parseFloat(elem.tableware?.price || 0)
          }
        },
      ],
    },
    {
      Header: 'Обстоятельства боя, лома, утраты, пропажи. Виновные лица (Должность, ФИО). Примечание',
      accessor: 'info',
      Cell: ({ row }) => <IconButton onClick={() => {
        setDetailsModalTarget(row.index);
        setDetailsData(data[row.index].details);
      }}><EditIcon /></IconButton>
    },
  ], [data]);

  const twoElementColumn = { display: 'flex', flexDirection: 'row', justifyContent: 'space-between' };
  const formControlStyle = { m: 1, width: '15rem' };
  const simpleColumn = { display: 'flex', flexDirection: 'row' };
  const labelStyle = { marginRight: '1rem' };

  return (
    <div className="App">
      <Paper elevation={3} style={{ padding: '20px' }}>
        <Typography variant='h5' align='left'>Акт о бое, ломе и устате посуды и приборов (форма N ОП-8)</Typography>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Row>
            <Col span={6} style={twoElementColumn}>
              <p>Структурное подразделение:</p>
              <FormControl variant="standard" sx={formControlStyle}>
                <Select
                  size='small'
                  style={{ width: '15rem' }}
                  value={genericData.subDiv}
                  onChange={event => updateValue('subDiv', event.target.value)}
                >
                  <MenuItem value={0}>Подразделение 1</MenuItem>
                  <MenuItem value={1}>Подразделение 2</MenuItem>
                </Select>
              </FormControl>
            </Col>
            <Col span={6} style={twoElementColumn}>
              <p>Номер документа:</p>
              <TextField
                placeholder='123-456'
                size='small'
                value={genericData.documentNumber}
                onChange={event => updateValue('documentNumber', event.target.value)}
                sx={formControlStyle} />
            </Col>
          </Row>

          <Row>
            <Col span={6} style={twoElementColumn}>
              <p>Дата утверждения:</p>
              <DesktopDatePicker
                value={genericData.confirmDate}
                onChange={newVal => updateValue('confirmDate', newVal)}
                renderInput={(params) =>
                  <FormControl variant="standard" sx={formControlStyle}>
                    <TextField
                      {...params}
                      size='small' />
                  </FormControl>
                }
              />
            </Col>
            <Col span={6} style={twoElementColumn}>
              <p>Дата составления:</p>
              <DesktopDatePicker
                value={genericData.creationDate}
                onChange={newVal => updateValue('creationDate', newVal)}
                renderInput={(params) =>
                  <FormControl variant="standard" sx={formControlStyle}>
                    <TextField {...params} style={{ width: '15rem' }} size='small' />
                  </FormControl>
                }
              />
            </Col>
          </Row>
          <Divider />

          <Row>
            <Col>
              <p style={labelStyle}>Отчётный период:</p>
            </Col>
            <Col style={simpleColumn}>
              <p>C</p>
              <FormControl id="periodFrom">
                <DesktopDatePicker
                  value={genericData.periodFrom}
                  onChange={newVal => updateValue('periodFrom', newVal)}
                  renderInput={(params) =>
                    <FormControl variant="standard" sx={formControlStyle}>
                      <TextField {...params} size='small' />
                    </FormControl>
                  }
                />
              </FormControl>
            </Col>
            <Col style={simpleColumn}>
              <p>По</p>
              <FormControl id="periodTo">
                <DesktopDatePicker
                  value={genericData.periodTo}
                  onChange={newVal => updateValue('periodTo', newVal)}
                  renderInput={(params) =>
                    <FormControl variant="standard" sx={formControlStyle}>
                      <TextField {...params} style={{ width: '15rem' }} size='small' />
                    </FormControl>
                  }
                />
              </FormControl>
            </Col>
          </Row>

          <Row>
            <Col>
              <p style={labelStyle}>
                Материально-ответственное лицо:
              </p>
            </Col>
            <Col span={3} style={twoElementColumn}>
              <p>Должность</p>
              <TextField
                placeholder='Повар'
                size='small'
                sx={formControlStyle}
                onChange={event => updateValue('responsiblePos', event.target.value)}
              />

            </Col>
            <Col span={3} style={twoElementColumn}>
              <p>ФИО</p>
              <TextField
                placeholder='Иванов Иван Иванович'
                size='small'
                sx={formControlStyle}
                onChange={event => updateValue('responsibleFio', event.target.value)}
              />
            </Col>
          </Row>
          <Divider />

          <Row style={{ marginTop: '1rem' }}>
            <Table columns={columns} data={data} />
          </Row>
        </LocalizationProvider>

        <Divider style={{ marginTop: '1rem', marginBottom: '1rem' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant='contained'
            startIcon={<AddIcon />}
            onClick={() => setComissionModalOpened(true)}
          >
            Внести данные комиссии
          </Button>
          <Button
            variant='outlined'
            onClick={() => {
              const transferObj = {data, genericData}
              debugger
            }}
            endIcon={<GridOnIcon />}
          >
            Выгрузить в Excel
          </Button>
        </div>
      </Paper>

      <Modal
        open={comissionModalOpened}
        onClose={() => setComissionModalOpened(false)}
      >
        <Paper style={{ padding: '1.5rem', width: '60%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant='h5'>Данные комиссии</Typography>
            <IconButton onClick={() => setComissionModalOpened(false)}><CloseIcon /></IconButton>
          </div>
          <Divider />
          <Row>
            <Col span={6} style={{ display: 'flex' }}>
              <p>Должность:</p>
              <TextField
                placeholder='Администратор'
                size='small'
                sx={formControlStyle}
                value={data.comissionData?.firstPersPos}
                onChange={(event) => setComissionData({ ...comissionData, firstPersPos: event.target.value })}
              />
            </Col>
            <Col span={6} style={{ display: 'flex' }}>
              <p>ФИО:</p>
              <TextField
                placeholder='Петров Пётр Петрович'
                size='small'
                sx={formControlStyle}
                value={data.comissionData?.firstPersName}
                onChange={(event) => setComissionData({ ...comissionData, firstPersName: event.target.value })}
              />
            </Col>
          </Row>
          <Row>
            <Col span={6} style={{ display: 'flex' }}>
              <p>Должность:</p>
              <TextField
                size='small'
                sx={formControlStyle}
                value={data.comissionData?.secondPersPos}
                onChange={(event) => setComissionData({ ...comissionData, secondPersPos: event.target.value })}
              />
            </Col>
            <Col span={6} style={{ display: 'flex' }}>
              <p>ФИО:</p>
              <TextField
                size='small'
                sx={formControlStyle}
                value={data.comissionData?.secondPersName}
                onChange={(event) => setComissionData({ ...comissionData, secondPersName: event.target.value })}
              />
            </Col>
          </Row>
          <Row>
            <Col span={6} style={{ display: 'flex' }}>
              <p>Должность:</p>
              <TextField
                size='small'
                sx={formControlStyle}
                value={data.comissionData?.thirdPersPos}
                onChange={(event) => setComissionData({ ...comissionData, thirdPersPos: event.target.value })}
              />
            </Col>
            <Col span={6} style={{ display: 'flex' }}>
              <p>ФИО:</p>
              <TextField
                size='small'
                sx={formControlStyle}
                value={data.comissionData?.thirdPersName}
                onChange={(event) => setComissionData({ ...comissionData, thirdPersName: event.target.value })}
              />
            </Col>
          </Row>
          <Divider />
          <p>Решение комиссии:</p>
          <TextField
            size='small'
            style={{ width: '100%', marginBottom: '1rem' }}
            value={data.comissionData?.comissionDecision}
            onChange={(event) => setComissionData({ ...comissionData, comissionDecision: event.target.value })}
            rows={5}
            multiline
          />
          <Button
            variant='contained'
            startIcon={<SaveIcon />}
            onClick={() => {
              updateValue('comissionData', comissionData);
              setComissionModalOpened(false);
            }}
          >
            Сохранить
          </Button>
        </Paper>
      </Modal>

      <Modal
        open={detailsModalTarget !== -1}
        onClose={() => setDetailsModalTarget(-1)}
      >
        <Paper style={{ padding: '1.5rem', width: '60%', display: 'flex', flexDirection: 'column'}}>
          <p>Обстоятельства боя, лома, утраты, пропажи. Виновные лица (Должность, ФИО). Примечание</p>
          <TextField
            placeholder='Обстоятельства'
            size='small'
            sx={{width: '100%', marginBottom: '1em'}}

            value={detailsData}
            onChange={(event) => setDetailsData(event.target.value)}
            multiline
          />
          <Button
            variant='contained'
            color='success'
            onClick={() => {
              updateTableValue(detailsModalTarget, 'details', detailsData);
              setDetailsData('');
              setDetailsModalTarget(-1);
            }}
          >
            Сохранить
          </Button>
        </Paper>
      </Modal>

    </div>
  );
}

export default App;
