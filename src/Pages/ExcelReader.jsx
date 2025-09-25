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
} from "@mui/material";
import * as XLSX from "xlsx";
import viewIcon from "../assets/edit.png";
import forward from "../assets/forward.png";
import backward from "../assets/back.png";
import { useNavigate } from "react-router-dom";

const ExcelReader = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [openFilter, setFilter] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

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
    console.log("handleFilter");
    setFilter(true);
  };

  const authors = [
    ...new Set(
      data.map((item) => {
        console.log("item");
        return item.Author;
      })
    ),
  ];
  const years = [...new Set(data.map((item) => item.PublishedYear))];

  console.log("authors000", authors);
  const [filteredAuthor, setFilteredAuthor] = useState([]);

  const handleChange = (event) => {
    const {
      target: { value },
    } = event;
    setFilteredAuthor(typeof value === "string" ? value.split(",") : value);
  };

  console.log("filteredAuthor", filteredAuthor);

  const handleCloseFilter = () => {
    setFilter(false);
  };

  const handleApply = () => {
    console.log("data11", data);
    console.log("selected items", filteredAuthor);

    const filteredData = data.filter((item) =>
      filteredAuthor.includes(item.Author)
    );
    setData(filteredData);
  };

  const handleReferesh = () => {
    console.log("refresh");
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
      <h1>Books Data</h1>

      <Box
        sx={{
          display: "flex",
          gap: "15px",
          justifyContent: data.length === 0 ? "center" : "flex-end",
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
          <Button variant="contained" component="span">
            Upload File
          </Button>
        </label>
        <Box display="flex" gap={2} justifyContent="flex-end">
          {data.length > 0 && (
            <Button variant="contained" onClick={handleDownload}>
              Download
            </Button>
          )}

          {data.length > 0 && (
            <Button variant="contained" onClick={() => handleFilter()}>
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
                  <ListItem disablePadding>
                    <ListItemButton onClick={() => setSelectedFilter("year")}>
                      <ListItemText primary="By Published Year" />
                    </ListItemButton>
                  </ListItem>
                </List>

                {/* Right Side: Filter content based on selection */}
                <Box flex={1} padding={2}>
                  {selectedFilter === "author" && (
                    <Box>
                      {/* <Typography variant="subtitle1">Authors:</Typography>
                    {authors.map((author) => (
                      <Typography key={author}>• {author}</Typography>
                    ))} */}
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
                  {selectedFilter === "year" && (
                    // <Box>
                    //   <Typography variant="subtitle1">Published Years:</Typography>
                    //   {years.map((year) => (
                    //     <Typography key={year}>• {year}</Typography>
                    //   ))}
                    // </Box>
                    <Box>
                      <TextField
                        label="Enter the year"
                        variant="outlined"
                        size="small"
                      ></TextField>
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
      <Typography
        style={{
          display: "flex",
          gap: "15px",
          justifyContent: "flex-start",
          fontSize: '24px'
          
        }}
      >{`Total Count : ${data.length}`}</Typography>
      <div style={{ width: "100%", overflowX: "auto" }}>
        {data.length > 0 && (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr>
                <th style={{ border: "1px solid black", padding: "8px" }}>
                  S.No
                </th>
                <th style={{ border: "1px solid black", padding: "8px" }}>
                  Title
                </th>
                <th style={{ border: "1px solid black", padding: "8px" }}>
                  Author
                </th>
                <th style={{ border: "1px solid black", padding: "8px" }}>
                  Genre
                </th>
                <th style={{ border: "1px solid black", padding: "8px" }}>
                  Year
                </th>
                <th style={{ border: "1px solid black", padding: "8px" }}>
                  ISBN
                </th>
              </tr>
            </thead>
            <tbody>
              {currentRows.map((item, index) => (
                <tr key={index}>
                  <td style={{ border: "1px solid black", padding: "8px" }}>
                    {index + 1}
                  </td>
                  <td style={{ border: "1px solid black", padding: "8px" }}>
                    {editIndex === index ? (
                      <TextField
                        value={item.Title}
                        onChange={(e) => handleCellChange(e, index, "Title")}
                        size="small"
                      />
                    ) : (
                      item.Title
                    )}
                  </td>
                  <td style={{ border: "1px solid black", padding: "8px" }}>
                    {editIndex === index ? (
                      <TextField
                        value={item.Author}
                        onChange={(e) => handleCellChange(e, index, "Author")}
                        size="small"
                      />
                    ) : (
                      item.Author
                    )}
                  </td>
                  <td style={{ border: "1px solid black", padding: "8px" }}>
                    {editIndex === index ? (
                      <TextField
                        value={item.Genre}
                        onChange={(e) => handleCellChange(e, index, "Genre")}
                        size="small"
                      />
                    ) : (
                      item.Genre
                    )}
                  </td>
                  <td style={{ border: "1px solid black", padding: "8px" }}>
                    {editIndex === index ? (
                      <TextField
                        value={item.PublishedYear}
                        onChange={(e) =>
                          handleCellChange(e, index, "PublishedYear")
                        }
                        size="small"
                      />
                    ) : (
                      item.PublishedYear
                    )}
                  </td>
                  <td style={{ border: "1px solid black", padding: "8px" }}>
                    {editIndex === index ? (
                      <TextField
                        value={item.ISBN}
                        onChange={(e) => handleCellChange(e, index, "ISBN")}
                        size="small"
                      />
                    ) : (
                      item.ISBN
                    )}
                  </td>
                  <td style={{ border: "1px solid black", padding: "8px" }}>
                    {editIndex === index ? (
                      <Button onClick={() => setEditIndex(null)}>Save</Button>
                    ) : (
                      <Button
                        onClick={() => setEditIndex(index)}
                        style={{ display: "flex", gap: "10px" }}
                      >
                        <Typography style={{}}>Edit</Typography>
                        <img
                          src={viewIcon}
                          alt="edit"
                          style={{ width: 20, height: 20 }}
                        />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {data.length > 0 && (
        <div
          style={{ marginTop: "10px", display: "flex", flexDirection: "row" , alignItems: 'center', justifyContent: 'flex-end'}}
        >
          <Button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            <img src={backward}></img>
          </Button>
          <Typography style={{  textAlign: 'center' }}>
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
