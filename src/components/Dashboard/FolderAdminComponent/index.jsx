import { faFile } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useParams, useHistory } from 'react-router-dom';
import {
  getAdminFiles,
  getAdminFolders,
  selectItem,
  deselectAll,
} from '../../../redux/actionCreators/filefoldersActionCreators.js';
import SubNav from '../SubNav.js/index.jsx';
import SearchBar from '../../SearchBar/index.jsx';

const FolderAdminComponent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { folderId } = useParams();
  const dispatch = useDispatch();
  const history = useHistory();

  const { files, folders, isLoading, selectedItems } = useSelector(
    (state) => ({
      files: state.filefolders.adminFiles,
      folders: state.filefolders.adminFolders,
      isLoading: state.filefolders.isLoading,
      selectedItems: state.filefolders.selectedItems,
    }),
    shallowEqual
  );

  useEffect(() => {
    if (isLoading) {
      dispatch(getAdminFolders());
      dispatch(getAdminFiles());
    }
  }, [dispatch, isLoading]);

  if (isLoading) {
    return (
      <Row>
        <Col>
          <h1 className="text-center my-5">Loading...</h1>
        </Col>
      </Row>
    );
  }

  const currentFolder = folders.find((f) => f.docId === folderId);
  const directFiles = files.filter((f) => f.data.parent === folderId);

  const matches =
    searchTerm.length >= 3
      ? directFiles.filter((f) =>
          f.data.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : [];

  const isItemSelected = (docId) =>
    !!selectedItems.find((item) => item.docId === docId);

  const openInFolder = (file) => {
    dispatch(deselectAll());
    history.push(`/dashboard/folder/admin/${folderId}`);
    dispatch(selectItem({ docId: file.docId, data: file.data, type: 'file' }));
    setSearchTerm('');
  };

  return (
    <>
      <SearchBar value={searchTerm} onChange={setSearchTerm} />

      {searchTerm.length >= 3 && (
        <div className="search-results px-5">
          {matches.length > 0 ? (
            matches.map((file) => (
              <div
                key={file.docId}
                className="search-item py-1 border-bottom"
                style={{ cursor: 'pointer' }}
                onClick={() => openInFolder(file)}
              >
                <strong>{file.data.name}</strong>
              </div>
            ))
          ) : (
            <div className="text-muted px-2 py-1">No results found 😞</div>
          )}
        </div>
      )}

      <SubNav currentFolder={currentFolder} />

      <Row>
        <Col md="12">
          <p className="border-bottom py-2">Admin Files</p>
          <div style={{ height: 150 }} className="pt-2 pb-4 px-5">
            {directFiles.length === 0 ? (
              <h5 className="text-center">No files found.</h5>
            ) : (
              directFiles.map(({ data, docId }) => (
                <Col
                  key={docId}
                  md={2}
                  className={`border h-100 mr-2 d-flex flex-column align-items-center justify-content-center rounded-2 py-1 ${
                    isItemSelected(docId) ? 'text-white shadow-sm' : ''
                  }`}
                  onClick={() =>
                    dispatch(
                      selectItem({ docId, data, type: 'file' })
                    )
                  }
                >
                  <FontAwesomeIcon icon={faFile} size="3x" />
                  <p className="mt-2">{data.name}</p>
                </Col>
              ))
            )}
          </div>
        </Col>
      </Row>
    </>
  );
};

export default FolderAdminComponent;
