import { useState } from "react";
import {
  Button,
  Menu,
  MenuItem,
  Table,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  useMediaQuery,
} from "@mui/material";
import * as XLSX from "xlsx";
import viewIcon from "../../assets/edit.png";
import forward from "../../assets/forward.png";
import backward from "../../assets/back.png";
import { useTheme } from "@mui/material/styles";
import style from "../BooksData/style.module.css";

const ExcelReader = () => {
  const [data, setData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [openFilter, setFilter] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("author");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Calculate the data to display on the current page
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = data.slice(indexOfFirstRow, indexOfLastRow);

  // Total number of pages
  const totalPages = Math.ceil(data.length / rowsPerPage);
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const binaryStr = e.target.result;
      const workbook = XLSX.read(binaryStr, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      setData(jsonData);
      setOriginalData(jsonData);
    };
    reader.readAsBinaryString(file);
  };

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;

  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
      },
    },
  };

  const handleDownload = () => {
    // 1. Convert JSON data to worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);

    // 2. Create a new workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // 3. Export workbook to Excel file
    XLSX.writeFile(workbook, "UpdatedData.xlsx");
  };

  const handleCellChange = (e, index, field) => {
    const newData = [...data];
    newData[index][field] = e.target.value;
    setData(newData);
  };

  const handleFilter = () => {
    setFilter(true);
  };

  const authors = [
    ...new Set(
      data.map((item) => {
        return item.Author;
      })
    ),
  ];


  const genre = [
      ...new Set(
      data.map((item) => {
        return item.Genre;
      })
    ),
  ]
  const years = [...new Set(data.map((item) => item.PublishedYear))];

  const [filteredAuthor, setFilteredAuthor] = useState([]);

  const handleChange = (event) => {
    const {
      target: { value },
    } = event;
    setFilteredAuthor(typeof value === "string" ? value.split(",") : value);
  };

  const handleCloseFilter = () => {
    setFilter(false);
  };

  const handleApply = () => {
    const filteredData = data.filter((item) =>
      filteredAuthor.includes(item.Author)
    );
    setData(filteredData);
  };

  const handleReferesh = () => {
    setFilteredAuthor([]);
    setData([...originalData]);
  };

  return (
    <div
      style={{
        width: "90vw",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        padding: "0 0",
      }}
    >
      <Typography style={{ fontSize: isMobile ? "21px" : "42px" }}>
        Books Data
      </Typography>

      <Box
        sx={{
          display: "flex",
          gap: "15px",
          justifyContent: data.length === 0 || isMobile ? "center" : "flex-end",
          flexDirection: "row",
        }}
      >
        <label htmlFor="upload-excel">
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            id="upload-excel"
            style={{ display: "none" }}
            onChange={handleFileUpload}
          />
          <Button
            variant="contained"
            component="span"
            size="small"
            sx={{
              minWidth: isMobile ? "60px" : "120px",
              height: isMobile ? "32px" : "40px",
              fontSize: isMobile ? "10px" : "18px",
              padding: "4px 8px",
              textTransform: "none",
            }}
          >
            Upload File
          </Button>
        </label>
        <Box display="flex" gap={2} justifyContent="flex-end">
          {data.length > 0 && (
            <Button
              variant="contained"
              onClick={handleDownload}
              sx={{
                minWidth: isMobile ? "60px" : "120px",
                height: isMobile ? "32px" : "40px",
                fontSize: isMobile ? "10px" : "18px",
                padding: "4px 8px",
                textTransform: "none",
              }}
            >
              Download
            </Button>
          )}

          {data.length > 0 && (
            <Button
              variant="contained"
              onClick={() => handleFilter()}
              sx={{
                minWidth: isMobile ? "60px" : "120px",
                height: isMobile ? "32px" : "40px",
                fontSize: isMobile ? "10px" : "18px",
                padding: "4px 8px",
                textTransform: "none",
              }}
            >
              Filter
            </Button>
          )}
          <Dialog
            open={openFilter}
            onClose={handleCloseFilter}
            fullWidth
            maxWidth="sm"
          >
            <DialogTitle>Filter</DialogTitle>
            <DialogContent>
              <Box display="flex" gap={2}>
                {/* Left Side: Filter options */}
                <List sx={{ width: "150px", borderRight: "1px solid #ccc" }}>
                  <ListItem disablePadding>
                    <ListItemButton onClick={() => setSelectedFilter("author")}>
                      <ListItemText primary="By Author" />
                    </ListItemButton>
                  </ListItem>
                 
                </List>

                <Box flex={1} padding={2}>
                  {selectedFilter === "author" && (
                    <Box>
                      <FormControl sx={{ m: 1, width: 300 }}>
                        <InputLabel id="demo-multiple-name-label">
                          Authors
                        </InputLabel>
                        <Select
                          labelId="demo-multiple-name-label"
                          id="demo-multiple-name"
                          multiple
                          value={filteredAuthor}
                          onChange={handleChange}
                          input={<OutlinedInput label="Authors" />}
                          MenuProps={MenuProps}
                        >
                          {authors.map((name) => (
                            <MenuItem key={name} value={name}>
                              {name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                  )}

                  <Box
                    sx={{ display: "flex", gap: "10px", flexDirection: "row" }}
                  >
                    <Button variant="contained" onClick={handleReferesh}>
                      Refresh
                    </Button>
                    <Button variant="contained" onClick={handleApply}>
                      Apply
                    </Button>
                  </Box>
                  {!selectedFilter && (
                    <Typography>Select a filter on the left</Typography>
                  )}
                </Box>
              </Box>
            </DialogContent>
          </Dialog>
        </Box>
      </Box>
      {data.length > 0 && (
        <Typography
          style={{
            display: "flex",
            gap: "15px",
            justifyContent: "flex-start",
            fontSize: "24px",
          }}
        >{`Total Count : ${data.length}`}</Typography>
      )}
      <div style={{ width: "100%", overflowX: "auto", scrollbarWidth: "10px" }}>
        {data.length > 0 && (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: isMobile ? "12px" : "14px",
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    border: "1px solid black",
                    padding: isMobile ? "6px" : "10px",
                    whiteSpace: "nowrap",
                  }}
                >
                  S.No
                </th>
                <th
                  style={{
                    border: "1px solid black",
                    padding: isMobile ? "6px" : "10px",
                    whiteSpace: "nowrap",
                  }}
                >
                  Title
                </th>
                <th
                  style={{
                    border: "1px solid black",
                    padding: isMobile ? "6px" : "10px",
                    whiteSpace: "nowrap",
                  }}
                >
                  Author
                </th>
                <th
                  style={{
                    border: "1px solid black",
                    padding: isMobile ? "6px" : "10px",
                    whiteSpace: "nowrap",
                  }}
                >
                  Genre
                </th>
                <th
                  style={{
                    border: "1px solid black",
                    padding: isMobile ? "6px" : "10px",
                    whiteSpace: "nowrap",
                  }}
                >
                  Year
                </th>
                <th
                  style={{
                    border: "1px solid black",
                    padding: isMobile ? "6px" : "10px",
                    whiteSpace: "nowrap",
                  }}
                >
                  ISBN
                </th>
              </tr>
            </thead>
            <tbody>
              {currentRows.map((item, index) => {
                const globalIndex = (currentPage - 1) * rowsPerPage + index;

                return (
                  <tr key={globalIndex}>
                    <td
                      style={{
                        border: "1px solid black",
                        padding: isMobile ? "6px" : "10px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {globalIndex + 1}
                    </td>

                    {/* Title */}
                    <td
                      style={{
                        border: "1px solid black",
                        padding: isMobile ? "6px" : "10px",
                      }}
                    >
                      {editIndex === globalIndex ? (
                        <TextField
                          value={item.Title}
                          onChange={(e) =>
                            handleCellChange(e, globalIndex, "Title")
                          }
                          size="small"
                        />
                      ) : (
                        item.Title
                      )}
                    </td>

                    {/* Author */}
                    <td
                      style={{
                        border: "1px solid black",
                        padding: isMobile ? "6px" : "10px",
                      }}
                    >
                      {editIndex === globalIndex ? (
                        <TextField
                          value={item.Author}
                          onChange={(e) =>
                            handleCellChange(e, globalIndex, "Author")
                          }
                          size="small"
                        />
                      ) : (
                        item.Author
                      )}
                    </td>

                    {/* Genre */}
                    <td
                      style={{
                        border: "1px solid black",
                        padding: isMobile ? "6px" : "10px",
                      }}
                    >
                      {editIndex === globalIndex ? (
                        <TextField
                          value={item.Genre}
                          onChange={(e) =>
                            handleCellChange(e, globalIndex, "Genre")
                          }
                          size="small"
                        />
                      ) : (
                        item.Genre
                      )}
                    </td>

                    {/* Year */}
                    <td
                      style={{
                        border: "1px solid black",
                        padding: isMobile ? "6px" : "10px",
                      }}
                    >
                      {editIndex === globalIndex ? (
                        <TextField
                          value={item.PublishedYear}
                          onChange={(e) =>
                            handleCellChange(e, globalIndex, "PublishedYear")
                          }
                          size="small"
                        />
                      ) : (
                        item.PublishedYear
                      )}
                    </td>

                    {/* ISBN */}
                    <td
                      style={{
                        border: "1px solid black",
                        padding: isMobile ? "6px" : "10px",
                      }}
                    >
                      {editIndex === globalIndex ? (
                        <TextField
                          value={item.ISBN}
                          onChange={(e) =>
                            handleCellChange(e, globalIndex, "ISBN")
                          }
                          size="small"
                        />
                      ) : (
                        item.ISBN
                      )}
                    </td>

                    {/* Edit / Save button */}
                    <td
                      style={{
                        border: "1px solid black",
                        padding: isMobile ? "6px" : "10px",
                      }}
                    >
                      {editIndex === globalIndex ? (
                        <Button onClick={() => setEditIndex(null)}>Save</Button>
                      ) : (
                        <Button
                          onClick={() => setEditIndex(globalIndex)}
                          style={{ display: "flex", gap: "10px" }}
                        >
                          <Typography
                            style={{ fontSize: isMobile ? "12px" : "16px" }}
                          >
                            Edit
                          </Typography>
                          <img
                            src={viewIcon}
                            alt="edit"
                            style={{ width: 20, height: 20 }}
                          />
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      {/*Pagination*/}
      {data.length > 0 && (
        <div
          style={{
            marginTop: "10px",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          <Button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            <img src={backward}></img>
          </Button>
          <Typography style={{ textAlign: "center" }}>
            Page {currentPage} of {totalPages}
          </Typography>
          <Button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            <img src={forward}></img>
          </Button>
        </div>
      )}
    </div>
  );
};

export default ExcelReader;
